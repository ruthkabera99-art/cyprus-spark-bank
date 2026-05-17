import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCryptoBalances } from '@/hooks/useCryptoBalances';
import { useTransactions } from '@/hooks/useTransactions';
import { useTransactionNotifications } from '@/hooks/useTransactionNotifications';
import { useCryptoBalanceNotifications } from '@/hooks/useCryptoBalanceNotifications';
import { useLoanStatusNotifications } from '@/hooks/useLoanStatusNotifications';
import { 
  Wallet,
  Bitcoin, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  FileText,
  TrendingUp,
  Shield,
  Bell,
  Settings,
  LogOut,
  Copy,
  CheckCircle2,
  Loader2,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CryptoCard } from '@/components/dashboard/CryptoCard';
import { TransactionItem } from '@/components/dashboard/TransactionItem';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: cryptoBalances, isLoading: cryptoLoading } = useCryptoBalances();
  const { data: transactions, isLoading: txLoading } = useTransactions(8);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'traditional' | 'crypto'>('all');
  
  // Enable real-time notifications
  useTransactionNotifications();
  useCryptoBalanceNotifications();
  useLoanStatusNotifications();

  if (!user) return null;

  const isLoading = profileLoading || cryptoLoading || txLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const traditionalBalance = profile?.traditional_balance || 0;
  const totalCryptoValue = cryptoBalances?.reduce((sum, c) => sum + c.usdValue, 0) || 0;
  const totalBalance = traditionalBalance + totalCryptoValue;
  const displayName = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User';
  const accountNumber = `SB-${user.id.substring(0, 8).toUpperCase()}`;

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Account number copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    toast({ title: 'Signed out', description: 'You have been signed out successfully' });
  };

  // Transform transactions for TransactionItem component
  const formattedTransactions = transactions?.map(tx => ({
    id: tx.id,
    type: tx.type === 'loan_disbursement' ? 'loan' : tx.type === 'loan_payment' ? 'loan' : tx.type as any,
    description: tx.description || `${tx.type} - ${tx.currency}`,
    amount: tx.amount,
    currency: tx.currency,
    date: new Date(tx.created_at).toISOString().split('T')[0],
    status: tx.status,
    category: tx.category,
  })) || [];

  // Transform crypto balances for CryptoCard component
  const formattedCrypto = cryptoBalances?.map(c => ({
    currency: c.name,
    symbol: c.currency,
    balance: c.amount,
    usdValue: c.usdValue,
    icon: c.icon,
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard/profile" className="flex items-center gap-3">
              <UserAvatar
                src={profile?.avatar_url}
                name={profile?.full_name}
                email={user.email}
                alt="Profile"
                className="border-2 border-primary/20"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-foreground leading-tight">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground leading-tight">{user.email}</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/dashboard/notifications">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard/profile">
                  <Settings className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Welcome back, {displayName}!
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground">Account: {accountNumber}</p>
              <button onClick={copyAccountNumber} className="text-muted-foreground hover:text-primary transition-colors">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
            <p className="text-4xl font-bold text-foreground">
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="overflow-hidden">
            <div className="gradient-primary p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-primary-foreground" />
                  <div>
                    <p className="text-sm text-primary-foreground/80">Traditional Balance</p>
                    <p className="text-2xl font-bold text-primary-foreground">
                      ${traditionalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <TrendingUp className="w-6 h-6 text-primary-foreground/60" />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" asChild>
                  <Link to="/dashboard/deposit">Deposit</Link>
                </Button>
                <Button variant="secondary" size="sm" className="flex-1" asChild>
                  <Link to="/dashboard/withdraw">Withdraw</Link>
                </Button>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Bitcoin className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-sm text-white/80">Crypto Portfolio</p>
                    <p className="text-2xl font-bold text-white">
                      ${totalCryptoValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <TrendingUp className="w-6 h-6 text-white/60" />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" asChild>
                  <Link to="/dashboard/deposit?tab=crypto">Deposit Crypto</Link>
                </Button>
                <Button variant="secondary" size="sm" className="flex-1" asChild>
                  <Link to="/dashboard/withdraw?tab=crypto">Withdraw Crypto</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Crypto Holdings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="w-5 h-5 text-primary" />
              Crypto Holdings
            </CardTitle>
            <CardDescription>Your cryptocurrency portfolio breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {formattedCrypto.map((crypto) => (
                <CryptoCard key={crypto.symbol} crypto={crypto} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your accounts and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <QuickAction 
                icon={ArrowDownToLine}
                label="Deposit"
                description="Request a deposit"
                to="/dashboard/deposit"
              />
              <QuickAction 
                icon={ArrowUpFromLine}
                label="Withdraw"
                description="Withdraw to bank or wallet"
                to="/dashboard/withdraw"
              />
              <QuickAction 
                icon={ArrowLeftRight}
                label="Transfer"
                description="Send money to others"
                to="/dashboard/transfer"
              />
              <QuickAction 
                icon={FileText}
                label="Request Loan"
                description="Apply for a loan"
                to="/loans"
              />
              <QuickAction 
                icon={History}
                label="Activity History"
                description="View all transactions"
                to="/dashboard/activity"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest account activity</CardDescription>
              </div>
              <Tabs value={txFilter} onValueChange={(v) => setTxFilter(v as 'all' | 'traditional' | 'crypto')} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="traditional">Traditional</TabsTrigger>
                  <TabsTrigger value="crypto">Crypto</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const filteredTx = txFilter === 'all' 
                ? formattedTransactions 
                : formattedTransactions.filter(tx => tx.category === txFilter);
              
              return filteredTx.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{txFilter === 'all' ? 'No transactions yet' : `No ${txFilter} transactions`}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredTx.map((tx) => (
                    <TransactionItem key={tx.id} transaction={tx} />
                  ))}
                </div>
              );
            })()}
            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link to="/dashboard/activity">View All Transactions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
