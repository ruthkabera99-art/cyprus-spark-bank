import { Transaction } from '@/lib/mockData';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Landmark, 
  Bitcoin,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const getIcon = () => {
    switch (transaction.type) {
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5" />;
      case 'transfer':
        return <ArrowLeftRight className="w-5 h-5" />;
      case 'loan':
        return <Landmark className="w-5 h-5" />;
      case 'crypto_buy':
        return <TrendingUp className="w-5 h-5" />;
      case 'crypto_sell':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <ArrowLeftRight className="w-5 h-5" />;
    }
  };

  const getIconBgColor = () => {
    if (transaction.type === 'deposit' || transaction.type === 'loan' || transaction.type === 'crypto_sell') {
      return 'bg-green-500/10 text-green-500';
    }
    if (transaction.type === 'withdrawal' || transaction.type === 'crypto_buy') {
      return 'bg-orange-500/10 text-orange-500';
    }
    return 'bg-blue-500/10 text-blue-500';
  };

  const getStatusBadge = () => {
    switch (transaction.status) {
      case 'completed':
        return <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10">Failed</Badge>;
      default:
        return null;
    }
  };

  const formatAmount = () => {
    const isPositive = transaction.amount > 0;
    const absAmount = Math.abs(transaction.amount);
    
    if (transaction.category === 'crypto') {
      return (
        <span className={isPositive ? 'text-green-500' : 'text-orange-500'}>
          {isPositive ? '+' : '-'}{absAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} {transaction.currency}
        </span>
      );
    }
    
    return (
      <span className={isPositive ? 'text-green-500' : 'text-foreground'}>
        {isPositive ? '+' : '-'}${absAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    );
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getIconBgColor()}`}>
          {getIcon()}
        </div>
        <div>
          <p className="font-medium text-foreground">{transaction.description}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(transaction.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>
      <div className="text-right flex items-center gap-4">
        <div>
          <p className="font-semibold">{formatAmount()}</p>
          {transaction.category === 'crypto' && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <Bitcoin className="w-3 h-3" /> Crypto
            </p>
          )}
        </div>
        {getStatusBadge()}
      </div>
    </div>
  );
}
