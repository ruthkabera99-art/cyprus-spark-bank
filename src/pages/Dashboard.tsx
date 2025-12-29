import { useAuth } from '@/contexts/AuthContext';
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
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CryptoCard } from '@/components/dashboard/CryptoCard';
import { TransactionItem } from '@/components/dashboard/TransactionItem';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const totalCryptoValue = user.cryptoBalances.reduce((sum, c) => sum + c.usdValue, 0);
  const totalBalance = user.traditionalBalance + totalCryptoValue;

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(user.accountNumber);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Account number copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({ title: 'Signed out', description: 'You have been signed out successfully' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-elegant">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold text-foreground">SecureBank</h1>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
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
              Welcome back, {user.firstName}!
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground">Account: {user.accountNumber}</p>
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
                      ${user.traditionalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
              {user.cryptoBalances.map((crypto) => (
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickAction 
                icon={ArrowDownToLine}
                label="Deposit"
                description="Add funds to your account"
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
              <Tabs defaultValue="all" className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="traditional">Traditional</TabsTrigger>
                  <TabsTrigger value="crypto">Crypto</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {user.transactions.slice(0, 8).map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline">View All Transactions</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
