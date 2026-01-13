import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCryptoPrices } from './useCryptoPrices';

export interface CryptoBalance {
  id: string;
  user_id: string;
  currency: string;
  amount: number;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
}

const cryptoConfig: Record<string, { name: string; icon: string }> = {
  BTC: { name: 'Bitcoin', icon: '₿' },
  ETH: { name: 'Ethereum', icon: 'Ξ' },
  USDT: { name: 'Tether', icon: '₮' },
};

export function useCryptoBalances() {
  const { user } = useAuth();
  const { data: priceData } = useCryptoPrices();

  return useQuery({
    queryKey: ['crypto-balances', user?.id, priceData?.prices],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('crypto_balances')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const prices = priceData?.prices || { BTC: 95000, ETH: 3300, USDT: 1 };
      const changes = priceData?.changes || { BTC: 0, ETH: 0, USDT: 0 };
      
      // Enrich with real-time prices and names
      return (data as CryptoBalance[]).map(balance => ({
        ...balance,
        name: cryptoConfig[balance.currency]?.name || balance.currency,
        icon: cryptoConfig[balance.currency]?.icon || '',
        price: prices[balance.currency] || 0,
        priceChange24h: changes[balance.currency] || 0,
        usdValue: (balance.amount || 0) * (prices[balance.currency] || 0),
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

// Re-export for backward compatibility
export { useCryptoPrices, getCryptoPrice } from './useCryptoPrices';
