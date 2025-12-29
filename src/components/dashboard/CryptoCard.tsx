import { CryptoBalance } from '@/lib/mockData';
import { TrendingUp, Bitcoin, Coins } from 'lucide-react';

interface CryptoCardProps {
  crypto: CryptoBalance;
}

export function CryptoCard({ crypto }: CryptoCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {crypto.icon}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{crypto.currency}</h4>
            <p className="text-xs text-muted-foreground">{crypto.symbol}</p>
          </div>
        </div>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-bold text-foreground">
          {crypto.balance.toLocaleString(undefined, { minimumFractionDigits: 4 })} {crypto.symbol}
        </p>
        <p className="text-sm text-muted-foreground">
          ≈ ${crypto.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}
