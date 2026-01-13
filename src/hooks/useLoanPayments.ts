import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LoanPayment {
  id: string;
  loan_id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'traditional' | 'crypto';
  status: string;
  reference_id: string | null;
  created_at: string;
}

export function useLoanPayments(loanId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['loan-payments', user?.id, loanId],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      let query = supabase
        .from('loan_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });
      
      if (loanId) {
        query = query.eq('loan_id', loanId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as LoanPayment[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateLoanPayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payment: { loan_id: string; amount: number; payment_method?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('loan_payments')
        .insert({
          loan_id: payment.loan_id,
          user_id: user.id,
          amount: payment.amount,
          payment_method: payment.payment_method || 'traditional',
          status: 'completed',
          reference_id: `PAY-${Date.now()}`,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['loan-payments', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['loan-applications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
    },
  });
}
