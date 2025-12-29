import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CryptoBalance {
  id: string;
  user_id: string;
  currency: string;
  amount: number;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
}

// Mock crypto prices - in real app, fetch from API
const cryptoPrices: Record<string, number> = {
  BTC: 42000,
  ETH: 3400,
  USDT: 1,
};

const cryptoConfig: Record<string, { name: string; icon: string }> = {
  BTC: { name: 'Bitcoin', icon: '₿' },
  ETH: { name: 'Ethereum', icon: 'Ξ' },
  USDT: { name: 'Tether', icon: '₮' },
};

export function useCryptoBalances() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['crypto-balances', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('crypto_balances')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Enrich with prices and names
      return (data as CryptoBalance[]).map(balance => ({
        ...balance,
        name: cryptoConfig[balance.currency]?.name || balance.currency,
        icon: cryptoConfig[balance.currency]?.icon || '',
        price: cryptoPrices[balance.currency] || 0,
        usdValue: (balance.amount || 0) * (cryptoPrices[balance.currency] || 0),
      }));
    },
    enabled: !!user?.id,
  });
}

export function useUpdateCryptoBalance() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ currency, amount }: { currency: string; amount: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('crypto_balances')
        .update({ amount })
        .eq('user_id', user.id)
        .eq('currency', currency)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto-balances', user?.id] });
    },
  });
}

export function getCryptoPrice(symbol: string): number {
  return cryptoPrices[symbol] || 0;
}
