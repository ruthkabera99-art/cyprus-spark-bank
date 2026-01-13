import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CoinGecko IDs for our supported cryptocurrencies
const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
};

// Fallback prices in case API fails
const FALLBACK_PRICES: Record<string, number> = {
  BTC: 95000,
  ETH: 3300,
  USDT: 1,
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const coinIds = Object.values(CRYPTO_IDS).join(',');
    
    // Fetch prices from CoinGecko (free API, no key required)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('CoinGecko API error:', response.status, response.statusText);
      // Return fallback prices if API fails
      return new Response(
        JSON.stringify({
          prices: FALLBACK_PRICES,
          changes: { BTC: 0, ETH: 0, USDT: 0 },
          source: 'fallback',
          timestamp: new Date().toISOString(),
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const data = await response.json();
    
    // Transform CoinGecko response to our format
    const prices: Record<string, number> = {};
    const changes: Record<string, number> = {};
    
    for (const [symbol, coinId] of Object.entries(CRYPTO_IDS)) {
      const coinData = data[coinId];
      if (coinData) {
        prices[symbol] = coinData.usd || FALLBACK_PRICES[symbol];
        changes[symbol] = coinData.usd_24h_change || 0;
      } else {
        prices[symbol] = FALLBACK_PRICES[symbol];
        changes[symbol] = 0;
      }
    }

    return new Response(
      JSON.stringify({
        prices,
        changes,
        source: 'coingecko',
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    
    // Return fallback prices on error
    return new Response(
      JSON.stringify({
        prices: FALLBACK_PRICES,
        changes: { BTC: 0, ETH: 0, USDT: 0 },
        source: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
