import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LoanPaymentWithDetails {
  id: string;
  loan_id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  reference_id: string | null;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
  loan_applications?: {
    purpose: string;
    amount: number;
  };
}

export function useAdminLoanPayments() {
  return useQuery({
    queryKey: ['admin-loan-payments'],
    queryFn: async () => {
      // Fetch payments with loan info
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('loan_payments')
        .select(`
          *,
          loan_applications:loan_id (purpose, amount)
        `)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Get unique user IDs
      const userIds = [...new Set(paymentsData.map(p => p.user_id))];
      
      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map for quick lookup
      const profilesMap = new Map(profilesData.map(p => [p.id, p]));

      // Combine data
      const enrichedPayments = paymentsData.map(payment => ({
        ...payment,
        profiles: profilesMap.get(payment.user_id) || null,
      }));

      return enrichedPayments as LoanPaymentWithDetails[];
    },
  });
}

export function useUpdateLoanPaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('loan_payments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loan-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
    },
  });
}

export function useDeleteLoanPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loan_payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loan-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
    },
  });
}
