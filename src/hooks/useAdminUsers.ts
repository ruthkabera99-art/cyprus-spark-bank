import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserWithDetails {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  traditional_balance: number | null;
  created_at: string | null;
  role: 'admin' | 'user';
  crypto_balances: {
    currency: string;
    amount: number | null;
  }[];
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Fetch all crypto balances
      const { data: cryptoBalances } = await supabase
        .from('crypto_balances')
        .select('user_id, currency, amount');

      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);
      const cryptoMap = new Map<string, { currency: string; amount: number | null }[]>();
      
      cryptoBalances?.forEach((cb) => {
        if (!cryptoMap.has(cb.user_id)) {
          cryptoMap.set(cb.user_id, []);
        }
        cryptoMap.get(cb.user_id)?.push({ currency: cb.currency, amount: cb.amount });
      });

      return profiles.map((profile) => ({
        ...profile,
        role: roleMap.get(profile.id) || 'user',
        crypto_balances: cryptoMap.get(profile.id) || [],
      })) as UserWithDetails[];
    },
  });
}

export function useUpdateUserBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, balance }: { userId: string; balance: number }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ traditional_balance: balance })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useUpdateCryptoBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      currency, 
      amount 
    }: { 
      userId: string; 
      currency: string; 
      amount: number 
    }) => {
      const { data, error } = await supabase
        .from('crypto_balances')
        .update({ amount })
        .eq('user_id', userId)
        .eq('currency', currency)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      updates 
    }: { 
      userId: string; 
      updates: {
        full_name?: string;
        phone?: string;
        address?: string;
      }
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}
