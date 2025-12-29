import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LoanApplication {
  id: string;
  user_id: string;
  amount: number;
  purpose: string;
  term_months: number;
  interest_rate: number;
  monthly_payment: number;
  collateral_type: 'real_estate' | 'vehicle' | 'equipment' | 'crypto' | 'other';
  collateral_value: number;
  collateral_description: string | null;
  crypto_currency: string | null;
  crypto_amount: number | null;
  ltv_ratio: number | null;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'active' | 'paid_off';
  submitted_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
  amount_paid: number;
  next_payment_date: string | null;
  remaining_payments: number | null;
}

export function useLoanApplications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['loan-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data as LoanApplication[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateLoanApplication() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (loan: Omit<LoanApplication, 'id' | 'user_id' | 'submitted_at' | 'reviewed_at' | 'approved_at' | 'amount_paid' | 'next_payment_date' | 'remaining_payments' | 'status'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('loan_applications')
        .insert({
          ...loan,
          user_id: user.id,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-applications', user?.id] });
    },
  });
}
