import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { type LoanApplication } from '@/lib/mockData';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-warning text-warning-foreground', textColor: 'text-warning' },
  under_review: { label: 'Under Review', icon: Search, color: 'bg-primary text-primary-foreground', textColor: 'text-primary' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'bg-success text-success-foreground', textColor: 'text-success' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-destructive text-destructive-foreground', textColor: 'text-destructive' },
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
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  if (!user) return null;

  const loans = user.loanApplications || [];
  
  const filteredLoans = activeTab === 'all' 
    ? loans 
    : loans.filter(loan => loan.status === activeTab);

  const activeLoan = loans.find(l => l.status === 'approved');
  const pendingCount = loans.filter(l => l.status === 'pending' || l.status === 'under_review').length;

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
              <h1 className="text-lg font-serif font-bold text-foreground">SecureBank</h1>
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
                  <p className="text-2xl font-bold">{loans.length}</p>
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
                  <p className="text-2xl font-bold">{loans.filter(l => l.status === 'approved').length}</p>
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
                    ${loans.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.amount, 0).toLocaleString()}
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
                      <Badge className={statusConfig.approved.color}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active Loan
                      </Badge>
                      <span className="text-sm text-muted-foreground">#{activeLoan.id}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">${activeLoan.amount.toLocaleString()}</h3>
                    <p className="text-muted-foreground">{activeLoan.purpose}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining Balance</p>
                      <p className="text-lg font-bold">${activeLoan.remainingBalance?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Payment</p>
                      <p className="text-lg font-bold">${activeLoan.nextPaymentAmount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="text-lg font-bold">{activeLoan.nextPaymentDate && formatDate(activeLoan.nextPaymentDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(activeLoan.paidPayments! / activeLoan.totalPayments!) * 100} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{activeLoan.paidPayments}/{activeLoan.totalPayments}</span>
                      </div>
                    </div>
                  </div>
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
                  const CollateralIcon = collateralIcons[loan.collateralType];
                  
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
                            <h4 className="font-semibold">${loan.amount.toLocaleString()}</h4>
                            <Badge variant="outline" className="text-xs">
                              {loan.termMonths}mo @ {loan.interestRate}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(loan.applicationDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <CollateralIcon className="w-3 h-3" />
                              {loan.collateralType.replace('_', ' ')}
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
                    <span>Loan Application #{selectedLoan.id}</span>
                    <Badge className={statusConfig[selectedLoan.status].color}>
                      {statusConfig[selectedLoan.status].label}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Applied on {formatDate(selectedLoan.applicationDate)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Loan Details */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
                        <p className="text-2xl font-bold">${selectedLoan.amount.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                        <p className="text-2xl font-bold">${selectedLoan.monthlyPayment.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Term</p>
                        <p className="text-lg font-semibold">{selectedLoan.termMonths} months</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
                        <p className="text-lg font-semibold">{selectedLoan.interestRate}% APR</p>
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
                            <span className="font-medium ml-2">{selectedLoan.collateralType.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Value:</span>
                            <span className="font-medium ml-2">${selectedLoan.collateralValue.toLocaleString()}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-muted-foreground">Description:</span>
                            <p className="font-medium mt-1">{selectedLoan.collateralDescription}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Crypto Collateral Details */}
                  {selectedLoan.cryptoCollateral && (
                    <Alert className="border-warning bg-warning/10">
                      <Bitcoin className="h-4 w-4" />
                      <AlertTitle className="flex items-center gap-2">
                        Crypto Collateral
                        {selectedLoan.cryptoCollateral.currentUsdValue < selectedLoan.cryptoCollateral.usdValueAtLock && (
                          <Badge variant="destructive" className="text-xs">
                            <TrendingDown className="w-3 h-3 mr-1" />
                            Value Decreased
                          </Badge>
                        )}
                      </AlertTitle>
                      <AlertDescription>
                        <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Locked Amount:</span>
                            <span className="font-medium ml-2">{selectedLoan.cryptoCollateral.amount} {selectedLoan.cryptoCollateral.currency}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Current Value:</span>
                            <span className="font-medium ml-2">${selectedLoan.cryptoCollateral.currentUsdValue.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">LTV Ratio:</span>
                            <span className="font-medium ml-2">{selectedLoan.cryptoCollateral.ltv}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Liquidation Threshold:</span>
                            <span className="font-medium ml-2">{selectedLoan.cryptoCollateral.liquidationThreshold}%</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Approved Loan Details */}
                  {selectedLoan.status === 'approved' && selectedLoan.remainingBalance !== undefined && (
                    <div>
                      <h4 className="font-semibold mb-2">Repayment Status</h4>
                      <Card className="bg-success/5 border-success/20">
                        <CardContent className="p-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Disbursed Amount</p>
                              <p className="text-lg font-bold">${selectedLoan.disbursedAmount?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Remaining Balance</p>
                              <p className="text-lg font-bold">${selectedLoan.remainingBalance?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Next Payment Date</p>
                              <p className="text-lg font-bold">{selectedLoan.nextPaymentDate && formatDate(selectedLoan.nextPaymentDate)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Payment Progress</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={(selectedLoan.paidPayments! / selectedLoan.totalPayments!) * 100} className="h-2 flex-1" />
                                <span className="text-sm font-medium">{selectedLoan.paidPayments}/{selectedLoan.totalPayments}</span>
                              </div>
                            </div>
                          </div>
                          <Button className="w-full mt-4 gradient-primary">Make Payment</Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Documents */}
                  {selectedLoan.collateralDocuments.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Uploaded Documents</h4>
                      <div className="space-y-2">
                        {selectedLoan.collateralDocuments.map(doc => (
                          <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">Uploaded {formatDate(doc.uploadedAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default LoanStatus;
