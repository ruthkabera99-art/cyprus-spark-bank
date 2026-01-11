import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type LoanApplication = Database['public']['Tables']['loan_applications']['Row'];
type LoanInsert = Database['public']['Tables']['loan_applications']['Insert'];
type LoanUpdate = Database['public']['Tables']['loan_applications']['Update'];
type LoanStatus = Database['public']['Enums']['loan_status'];

export interface LoanWithProfile extends LoanApplication {
  profiles?: {
    email: string;
    full_name: string | null;
    phone: string | null;
  } | null;
}

export function useAdminLoans() {
  return useQuery({
    queryKey: ['admin-loans'],
    queryFn: async () => {
      // Fetch loans
      const { data: loans, error: loansError } = await supabase
        .from('loan_applications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (loansError) throw loansError;

      // Get unique user IDs
      const userIds = [...new Set(loans.map((l) => l.user_id))];

      // Fetch profiles for those users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone')
        .in('id', userIds);

      // Map profiles to loans
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return loans.map((loan) => ({
        ...loan,
        profiles: profileMap.get(loan.user_id) || null,
      })) as LoanWithProfile[];
    },
  });
}

export function useUpdateLoanStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LoanStatus }) => {
      // First get the current loan to access term_months
      const { data: currentLoan } = await supabase
        .from('loan_applications')
        .select('term_months')
        .eq('id', id)
        .single();

      const updates: LoanUpdate = { status };
      
      if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
        updates.reviewed_at = new Date().toISOString();
        // Initialize remaining payments when loan is approved
        updates.remaining_payments = currentLoan?.term_months || null;
        // Set next payment date to 30 days from now
        const nextPayment = new Date();
        nextPayment.setDate(nextPayment.getDate() + 30);
        updates.next_payment_date = nextPayment.toISOString().split('T')[0];
      } else if (status === 'active') {
        // When moving to active, ensure payment tracking is set up
        if (!currentLoan?.term_months) {
          const { data: loan } = await supabase
            .from('loan_applications')
            .select('term_months, remaining_payments')
            .eq('id', id)
            .single();
          if (loan && !loan.remaining_payments) {
            updates.remaining_payments = loan.term_months;
          }
        }
      } else if (status === 'rejected' || status === 'under_review') {
        updates.reviewed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('loan_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan-applications'] });
    },
  });
}

export function useCreateAdminLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loan: Omit<LoanInsert, 'id' | 'submitted_at'>) => {
      const { data, error } = await supabase
        .from('loan_applications')
        .insert(loan)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
    },
  });
}

export function useUpdateAdminLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: LoanUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('loan_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
    },
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loan_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
    },
  });
}
