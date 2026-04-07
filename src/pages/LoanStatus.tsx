import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLoanApplications } from '@/hooks/useLoanApplications';
import { 
  Shield, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search,
  FileText,
  Calendar,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Bitcoin,
  ChevronRight,
  Building2,
  Car,
  HardDrive,
  Coins,
  Package,
  Plus,
  Loader2,
  CreditCard,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { type LoanApplication } from '@/hooks/useLoanApplications';
import { LoanPaymentDialog } from '@/components/loans/LoanPaymentDialog';
import { PaymentHistorySection } from '@/components/loans/PaymentHistorySection';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-warning text-warning-foreground', textColor: 'text-warning' },
  under_review: { label: 'Under Review', icon: Search, color: 'bg-primary text-primary-foreground', textColor: 'text-primary' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'bg-success text-success-foreground', textColor: 'text-success' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-destructive text-destructive-foreground', textColor: 'text-destructive' },
  active: { label: 'Active', icon: CheckCircle2, color: 'bg-success text-success-foreground', textColor: 'text-success' },
  paid_off: { label: 'Paid Off', icon: CheckCircle2, color: 'bg-muted text-muted-foreground', textColor: 'text-muted-foreground' },
};

const collateralIcons: Record<string, React.ElementType> = {
  real_estate: Building2,
  vehicle: Car,
  equipment: HardDrive,
  crypto: Coins,
  other: Package,
};

const LoanStatus = () => {
  const { user } = useAuth();
  const { data: loans, isLoading } = useLoanApplications();
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [paymentLoan, setPaymentLoan] = useState<LoanApplication | null>(null);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const loanList = loans || [];
  
  const filteredLoans = activeTab === 'all' 
    ? loanList 
    : loanList.filter(loan => loan.status === activeTab);

  const activeLoan = loanList.find(l => l.status === 'approved' || l.status === 'active');
  const pendingCount = loanList.filter(l => l.status === 'pending' || l.status === 'under_review').length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-elegant">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-serif font-bold text-foreground">MorganFinance Bank</h1>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/dashboard"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">My Loans</h1>
            <p className="text-muted-foreground">Track your loan applications and active loans</p>
          </div>
          <Button asChild className="gradient-primary">
            <Link to="/dashboard/apply-loan">
              <Plus className="w-4 h-4 mr-2" /> Apply for Loan
            </Link>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{loanList.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Loans</p>
                  <p className="text-2xl font-bold">{loanList.filter(l => l.status === 'approved' || l.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Borrowed</p>
                  <p className="text-2xl font-bold">
                    ${loanList.filter(l => l.status === 'approved' || l.status === 'active').reduce((sum, l) => sum + Number(l.amount), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Loan Highlight */}
        {activeLoan && (
          <Card className="mb-8 overflow-hidden">
            <div className="gradient-primary p-1">
              <div className="bg-card rounded-t-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={statusConfig[activeLoan.status].color}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active Loan
                      </Badge>
                      <span className="text-sm text-muted-foreground">#{activeLoan.id.substring(0, 8)}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">${Number(activeLoan.amount).toLocaleString()}</h3>
                    <p className="text-muted-foreground">{activeLoan.purpose}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining Balance</p>
                      <p className="text-lg font-bold">${(Number(activeLoan.amount) - Number(activeLoan.amount_paid || 0)).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-lg font-bold">${Number(activeLoan.monthly_payment).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Due Date</p>
                      <p className="text-lg font-bold">{activeLoan.next_payment_date ? formatDate(activeLoan.next_payment_date) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(Number(activeLoan.amount_paid || 0) / Number(activeLoan.amount)) * 100} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{Math.round((Number(activeLoan.amount_paid || 0) / Number(activeLoan.amount)) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Make Payment Button */}
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    onClick={() => setPaymentLoan(activeLoan)}
                    className="gradient-primary"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Make a Payment
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Loan Applications List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Loan Applications</CardTitle>
                <CardDescription>All your loan applications and their status</CardDescription>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {filteredLoans.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'all' 
                    ? "You haven't applied for any loans yet."
                    : `No ${activeTab} applications found.`}
                </p>
                <Button asChild>
                  <Link to="/dashboard/apply-loan">Apply for a Loan</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLoans.map(loan => {
                  const status = statusConfig[loan.status];
                  const StatusIcon = status.icon;
                  const CollateralIcon = collateralIcons[loan.collateral_type];
                  
                  return (
                    <div 
                      key={loan.id}
                      onClick={() => setSelectedLoan(loan)}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${status.color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">${Number(loan.amount).toLocaleString()}</h4>
                            <Badge variant="outline" className="text-xs">
                              {loan.term_months}mo @ {loan.interest_rate}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(loan.submitted_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <CollateralIcon className="w-3 h-3" />
                              {loan.collateral_type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="font-medium">{loan.purpose}</p>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loan Details Dialog */}
        <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedLoan && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span>Loan Application #{selectedLoan.id.substring(0, 8)}</span>
                    <Badge className={statusConfig[selectedLoan.status].color}>
                      {statusConfig[selectedLoan.status].label}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Applied on {formatDate(selectedLoan.submitted_at)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Loan Details */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
                        <p className="text-2xl font-bold">${Number(selectedLoan.amount).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                        <p className="text-2xl font-bold">${Number(selectedLoan.monthly_payment).toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Term</p>
                        <p className="text-lg font-semibold">{selectedLoan.term_months} months</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
                        <p className="text-lg font-semibold">{selectedLoan.interest_rate}% APR</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Purpose */}
                  <div>
                    <h4 className="font-semibold mb-2">Loan Purpose</h4>
                    <p className="text-muted-foreground">{selectedLoan.purpose}</p>
                  </div>

                  {/* Collateral Info */}
                  <div>
                    <h4 className="font-semibold mb-2">Collateral Information</h4>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium ml-2">{selectedLoan.collateral_type.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Value:</span>
                            <span className="font-medium ml-2">${Number(selectedLoan.collateral_value).toLocaleString()}</span>
                          </div>
                          {selectedLoan.collateral_description && (
                            <div className="sm:col-span-2">
                              <span className="text-muted-foreground">Description:</span>
                              <p className="font-medium mt-1">{selectedLoan.collateral_description}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Crypto Collateral Details */}
                  {selectedLoan.crypto_currency && selectedLoan.crypto_amount && (
                    <Alert className="border-warning bg-warning/10">
                      <Bitcoin className="h-4 w-4" />
                      <AlertTitle>Crypto Collateral</AlertTitle>
                      <AlertDescription>
                        <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Locked Amount:</span>
                            <span className="font-medium ml-2">{selectedLoan.crypto_amount} {selectedLoan.crypto_currency}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">LTV Ratio:</span>
                            <span className="font-medium ml-2">{selectedLoan.ltv_ratio}%</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Payment History for Active Loans */}
                  {(selectedLoan.status === 'approved' || selectedLoan.status === 'active') && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <History className="w-4 h-4" />
                            Payment History
                          </h4>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedLoan(null);
                              setPaymentLoan(selectedLoan);
                            }}
                            className="gradient-primary"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Make Payment
                          </Button>
                        </div>
                        <PaymentHistorySection 
                          loanId={selectedLoan.id} 
                          loanPurpose={selectedLoan.purpose} 
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        {paymentLoan && (
          <LoanPaymentDialog
            loan={paymentLoan}
            open={!!paymentLoan}
            onOpenChange={(open) => !open && setPaymentLoan(null)}
          />
        )}
      </main>
    </div>
  );
};

export default LoanStatus;
