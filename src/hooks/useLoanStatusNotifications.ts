import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface LoanPayload {
  id: string;
  user_id: string;
  amount: number;
  purpose: string;
  status: string;
}

const statusMessages: Record<string, { title: string; icon: string; variant: 'default' | 'destructive' }> = {
  pending: { title: 'Loan Application Submitted', icon: '📝', variant: 'default' },
  under_review: { title: 'Loan Under Review', icon: '🔍', variant: 'default' },
  approved: { title: 'Loan Approved!', icon: '✅', variant: 'default' },
  rejected: { title: 'Loan Application Rejected', icon: '❌', variant: 'destructive' },
  active: { title: 'Loan Now Active', icon: '💰', variant: 'default' },
  paid_off: { title: 'Loan Paid Off!', icon: '🎉', variant: 'default' },
};

export function useLoanStatusNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('loan-status-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'loan_applications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newLoan = payload.new as LoanPayload;
          const oldLoan = payload.old as LoanPayload;
          
          // Only notify if status changed
          if (newLoan.status !== oldLoan.status) {
            const statusInfo = statusMessages[newLoan.status] || {
              title: 'Loan Status Updated',
              icon: '📋',
              variant: 'default' as const,
            };

            toast({
              title: `${statusInfo.icon} ${statusInfo.title}`,
              description: `Your $${newLoan.amount.toLocaleString()} loan for "${newLoan.purpose}" is now ${newLoan.status.replace('_', ' ')}`,
              variant: statusInfo.variant,
            });

            // Refresh loan data
            queryClient.invalidateQueries({ queryKey: ['loan-applications', user.id] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'loan_applications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const loan = payload.new as LoanPayload;
          
          toast({
            title: '📝 Loan Application Submitted',
            description: `Your $${loan.amount.toLocaleString()} loan application for "${loan.purpose}" has been submitted`,
          });

          queryClient.invalidateQueries({ queryKey: ['loan-applications', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast, queryClient]);
}
