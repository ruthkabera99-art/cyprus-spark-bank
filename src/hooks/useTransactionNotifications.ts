import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface TransactionPayload {
  id: string;
  user_id: string;
  type: string;
  category: string;
  currency: string;
  amount: number;
  status: string;
  description: string | null;
}

export function useTransactionNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('transaction-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const tx = payload.new as TransactionPayload;
          const isDeposit = tx.type === 'deposit';
          const isWithdrawal = tx.type === 'withdrawal';
          const isTransfer = tx.type === 'transfer';
          
          let title = 'New Transaction';
          let description = '';
          
          if (isDeposit) {
            title = '💰 Deposit Received';
            description = `${tx.amount} ${tx.currency} has been deposited to your account`;
          } else if (isWithdrawal) {
            title = '📤 Withdrawal Initiated';
            description = `${tx.amount} ${tx.currency} withdrawal is ${tx.status}`;
          } else if (isTransfer) {
            title = '🔄 Transfer Completed';
            description = `${tx.amount} ${tx.currency} transfer is ${tx.status}`;
          } else {
            description = `${tx.type}: ${tx.amount} ${tx.currency}`;
          }

          toast({
            title,
            description,
          });

          // Refresh transaction data
          queryClient.invalidateQueries({ queryKey: ['transactions', user.id] });
          queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
          queryClient.invalidateQueries({ queryKey: ['crypto-balances', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const tx = payload.new as TransactionPayload;
          const oldTx = payload.old as TransactionPayload;
          
          // Only notify if status changed
          if (tx.status !== oldTx.status) {
            let title = 'Transaction Updated';
            let variant: 'default' | 'destructive' = 'default';
            
            if (tx.status === 'completed') {
              title = '✅ Transaction Completed';
            } else if (tx.status === 'failed') {
              title = '❌ Transaction Failed';
              variant = 'destructive';
            } else if (tx.status === 'cancelled') {
              title = '🚫 Transaction Cancelled';
              variant = 'destructive';
            }

            toast({
              title,
              description: `Your ${tx.type} of ${tx.amount} ${tx.currency} is now ${tx.status}`,
              variant,
            });

            // Refresh data
            queryClient.invalidateQueries({ queryKey: ['transactions', user.id] });
            queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
            queryClient.invalidateQueries({ queryKey: ['crypto-balances', user.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast, queryClient]);
}
