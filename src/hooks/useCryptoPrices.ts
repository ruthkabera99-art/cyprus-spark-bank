import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CryptoPrices {
  prices: Record<string, number>;
  changes: Record<string, number>;
  source: 'coingecko' | 'fallback';
  timestamp: string;
}

// Fallback prices used when edge function is unavailable
const FALLBACK_PRICES: Record<string, number> = {
  BTC: 95000,
  ETH: 3300,
  USDT: 1,
};

export function useCryptoPrices() {
  return useQuery({
    queryKey: ['crypto-prices'],
    queryFn: async (): Promise<CryptoPrices> => {
      try {
        const { data, error } = await supabase.functions.invoke('get-crypto-prices');
        
        if (error) {
          console.error('Error fetching crypto prices:', error);
          return {
            prices: FALLBACK_PRICES,
            changes: { BTC: 0, ETH: 0, USDT: 0 },
            source: 'fallback',
            timestamp: new Date().toISOString(),
          };
        }
        
        return data as CryptoPrices;
      } catch (err) {
        console.error('Failed to fetch crypto prices:', err);
        return {
          prices: FALLBACK_PRICES,
          changes: { BTC: 0, ETH: 0, USDT: 0 },
          source: 'fallback',
          timestamp: new Date().toISOString(),
        };
      }
    },
    // Refresh prices every 60 seconds
    refetchInterval: 60 * 1000,
    // Keep data fresh in background
    refetchIntervalInBackground: true,
    // Cache for 30 seconds
    staleTime: 30 * 1000,
  });
}

export function getCryptoPrice(prices: Record<string, number> | undefined, symbol: string): number {
  return prices?.[symbol] || FALLBACK_PRICES[symbol] || 0;
}
