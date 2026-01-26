import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TransactionWithUser {
  id: string;
  user_id: string;
  type: string;
  category: string;
  currency: string;
  amount: number;
  status: string;
  description: string | null;
  reference_id: string | null;
  recipient_address: string | null;
  network_fee: number | null;
  created_at: string | null;
  user_email?: string;
  user_name?: string;
}

export function useAdminTransactions() {
  return useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => {
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (txError) throw txError;

      // Get unique user IDs
      const userIds = [...new Set(transactions.map((t) => t.user_id))];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return transactions.map((tx) => {
        const profile = profileMap.get(tx.user_id);
        return {
          ...tx,
          user_email: profile?.email,
          user_name: profile?.full_name,
        };
      }) as TransactionWithUser[];
    },
  });
}

export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: {
        type?: string;
        category?: string;
        currency?: string;
        amount?: number;
        status?: string;
        description?: string;
        recipient_address?: string;
        network_fee?: number;
      }
    }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
    },
  });
}

export function useCreateAdminTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: {
      user_id: string;
      type: string;
      category: string;
      currency: string;
      amount: number;
      status: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

// Approve deposit and update user balance
export function useApproveDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      transactionId, 
      userId, 
      amount, 
      category, 
      currency 
    }: { 
      transactionId: string; 
      userId: string; 
      amount: number; 
      category: string; 
      currency: string;
    }) => {
      // Update transaction status to completed
      const { error: txError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transactionId);

      if (txError) throw txError;

      // Update user balance based on category
      if (category === 'traditional') {
        // Get current balance
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('traditional_balance')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        // Update traditional balance
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ traditional_balance: (profile.traditional_balance || 0) + amount })
          .eq('id', userId);

        if (updateError) throw updateError;
      } else if (category === 'crypto') {
        // Get current crypto balance
        const { data: cryptoBalance, error: cryptoError } = await supabase
          .from('crypto_balances')
          .select('amount')
          .eq('user_id', userId)
          .eq('currency', currency)
          .maybeSingle();

        if (cryptoError) throw cryptoError;

        if (cryptoBalance) {
          // Update existing balance
          const { error: updateError } = await supabase
            .from('crypto_balances')
            .update({ amount: (cryptoBalance.amount || 0) + amount })
            .eq('user_id', userId)
            .eq('currency', currency);

          if (updateError) throw updateError;
        } else {
          // Create new balance entry
          const { error: insertError } = await supabase
            .from('crypto_balances')
            .insert({ user_id: userId, currency, amount });

          if (insertError) throw insertError;
        }
      }

      return { transactionId, userId, amount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

// Admin update user balance directly
export function useAdminUpdateBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      balanceType, 
      amount, 
      currency,
      operation
    }: { 
      userId: string; 
      balanceType: 'traditional' | 'crypto'; 
      amount: number; 
      currency?: string;
      operation: 'set' | 'add' | 'subtract';
    }) => {
      if (balanceType === 'traditional') {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('traditional_balance')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        let newBalance: number;
        const currentBalance = profile.traditional_balance || 0;
        
        if (operation === 'set') {
          newBalance = amount;
        } else if (operation === 'add') {
          newBalance = currentBalance + amount;
        } else {
          newBalance = currentBalance - amount;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ traditional_balance: newBalance })
          .eq('id', userId);

        if (updateError) throw updateError;

        return { userId, newBalance, balanceType };
      } else if (balanceType === 'crypto' && currency) {
        const { data: cryptoBalance, error: cryptoError } = await supabase
          .from('crypto_balances')
          .select('amount')
          .eq('user_id', userId)
          .eq('currency', currency)
          .maybeSingle();

        if (cryptoError) throw cryptoError;

        let newBalance: number;
        const currentBalance = cryptoBalance?.amount || 0;
        
        if (operation === 'set') {
          newBalance = amount;
        } else if (operation === 'add') {
          newBalance = currentBalance + amount;
        } else {
          newBalance = currentBalance - amount;
        }

        if (cryptoBalance) {
          const { error: updateError } = await supabase
            .from('crypto_balances')
            .update({ amount: newBalance })
            .eq('user_id', userId)
            .eq('currency', currency);

          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('crypto_balances')
            .insert({ user_id: userId, currency, amount: newBalance });

          if (insertError) throw insertError;
        }

        return { userId, newBalance, balanceType, currency };
      }

      throw new Error('Invalid balance type');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
    },
  });
}
