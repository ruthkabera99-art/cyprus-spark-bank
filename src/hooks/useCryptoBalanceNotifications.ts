import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface CryptoBalancePayload {
  id: string;
  user_id: string;
  currency: string;
  amount: number;
  wallet_address: string | null;
}

const currencyIcons: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '₮',
};

export function useCryptoBalanceNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const previousBalances = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('crypto-balance-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crypto_balances',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newBalance = payload.new as CryptoBalancePayload;
          const oldBalance = payload.old as CryptoBalancePayload;
          
          const oldAmount = oldBalance.amount ?? 0;
          const newAmount = newBalance.amount ?? 0;
          const difference = newAmount - oldAmount;
          
          if (difference === 0) return;
          
          const icon = currencyIcons[newBalance.currency] || '💰';
          const isIncrease = difference > 0;
          
          toast({
            title: isIncrease 
              ? `${icon} ${newBalance.currency} Balance Increased` 
              : `${icon} ${newBalance.currency} Balance Decreased`,
            description: isIncrease
              ? `+${difference.toFixed(8)} ${newBalance.currency} added to your wallet`
              : `${difference.toFixed(8)} ${newBalance.currency} removed from your wallet`,
            variant: isIncrease ? 'default' : 'destructive',
          });

          // Refresh crypto balance data
          queryClient.invalidateQueries({ queryKey: ['crypto-balances', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crypto_balances',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newBalance = payload.new as CryptoBalancePayload;
          const icon = currencyIcons[newBalance.currency] || '💰';
          
          if (newBalance.amount && newBalance.amount > 0) {
            toast({
              title: `${icon} New ${newBalance.currency} Wallet`,
              description: `${newBalance.currency} wallet created with ${newBalance.amount} balance`,
            });
          }

          queryClient.invalidateQueries({ queryKey: ['crypto-balances', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast, queryClient]);
}
