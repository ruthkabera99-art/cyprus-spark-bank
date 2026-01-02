import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  type: 'transaction' | 'balance' | 'loan';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  icon: string;
}

const currencyIcons: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '₮',
  USD: '$',
};

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep max 20 notifications
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // Transaction notifications channel
    const transactionChannel = supabase
      .channel('header-transaction-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const tx = payload.new as any;
          const icon = currencyIcons[tx.currency] || '💰';
          
          let title = 'New Transaction';
          if (tx.type === 'deposit') title = 'Deposit Received';
          else if (tx.type === 'withdrawal') title = 'Withdrawal Initiated';
          else if (tx.type === 'transfer') title = 'Transfer Completed';

          addNotification({
            type: 'transaction',
            title,
            description: `${tx.amount} ${tx.currency} - ${tx.status}`,
            icon,
          });
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
          const tx = payload.new as any;
          const oldTx = payload.old as any;
          
          if (tx.status !== oldTx.status) {
            let icon = '📋';
            if (tx.status === 'completed') icon = '✅';
            else if (tx.status === 'failed') icon = '❌';
            else if (tx.status === 'cancelled') icon = '🚫';

            addNotification({
              type: 'transaction',
              title: `Transaction ${tx.status}`,
              description: `${tx.type}: ${tx.amount} ${tx.currency}`,
              icon,
            });
          }
        }
      )
      .subscribe();

    // Crypto balance notifications channel
    const balanceChannel = supabase
      .channel('header-balance-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crypto_balances',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newBalance = payload.new as any;
          const oldBalance = payload.old as any;
          
          const difference = (newBalance.amount ?? 0) - (oldBalance.amount ?? 0);
          if (difference === 0) return;
          
          const icon = currencyIcons[newBalance.currency] || '💰';
          const isIncrease = difference > 0;

          addNotification({
            type: 'balance',
            title: `${newBalance.currency} Balance ${isIncrease ? 'Increased' : 'Decreased'}`,
            description: `${isIncrease ? '+' : ''}${difference.toFixed(8)} ${newBalance.currency}`,
            icon,
          });
        }
      )
      .subscribe();

    // Loan status notifications channel
    const loanChannel = supabase
      .channel('header-loan-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'loan_applications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newLoan = payload.new as any;
          const oldLoan = payload.old as any;
          
          if (newLoan.status !== oldLoan.status) {
            const statusIcons: Record<string, string> = {
              pending: '📝',
              under_review: '🔍',
              approved: '✅',
              rejected: '❌',
              active: '💰',
              paid_off: '🎉',
            };

            addNotification({
              type: 'loan',
              title: `Loan ${newLoan.status.replace('_', ' ')}`,
              description: `$${newLoan.amount.toLocaleString()} - ${newLoan.purpose}`,
              icon: statusIcons[newLoan.status] || '📋',
            });
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
          const loan = payload.new as any;
          
          addNotification({
            type: 'loan',
            title: 'Loan Application Submitted',
            description: `$${loan.amount.toLocaleString()} - ${loan.purpose}`,
            icon: '📝',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transactionChannel);
      supabase.removeChannel(balanceChannel);
      supabase.removeChannel(loanChannel);
    };
  }, [user?.id, addNotification]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
