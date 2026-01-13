import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCryptoBalances } from '@/hooks/useCryptoBalances';
import { useCryptoPrices, getCryptoPrice } from '@/hooks/useCryptoPrices';
import { useCreateLoanApplication } from '@/hooks/useLoanApplications';
import { useToast } from '@/hooks/use-toast';
import { Shield, ArrowLeft, ArrowRight, Check, Upload, X, Bitcoin, AlertTriangle, Calculator, Building2, Car, HardDrive, Coins, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { loanConfig, calculateMonthlyPayment } from '@/lib/mockData';

const collateralIcons: Record<string, React.ElementType> = { real_estate: Building2, vehicle: Car, equipment: HardDrive, crypto: Coins, other: Package };

const LoanApplication = () => {
  const { user } = useAuth();
  const { data: cryptoBalances, isLoading: cryptoLoading } = useCryptoBalances();
  const { data: priceData } = useCryptoPrices();
  const createLoan = useCreateLoanApplication();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loanAmount, setLoanAmount] = useState(10000);
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanTerm, setLoanTerm] = useState(12);
  const [collateralType, setCollateralType] = useState('');
  const [collateralValue, setCollateralValue] = useState('');
  const [collateralDescription, setCollateralDescription] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [cryptoCurrency, setCryptoCurrency] = useState('BTC');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const interestRate = loanConfig.baseInterestRates[loanTerm as keyof typeof loanConfig.baseInterestRates] || 8.0;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
  const totalPayment = monthlyPayment * loanTerm;
  const totalInterest = totalPayment - loanAmount;
  
  const cryptoPrice = getCryptoPrice(priceData?.prices, cryptoCurrency);
  const cryptoUsdValue = parseFloat(cryptoAmount || '0') * cryptoPrice;
  const maxLoanFromCrypto = cryptoUsdValue * (loanConfig.cryptoLTV / 100);
  const userCryptoBalance = cryptoBalances?.find(c => c.currency === cryptoCurrency);
  const hasSufficientCrypto = userCryptoBalance && (userCryptoBalance.amount || 0) >= parseFloat(cryptoAmount || '0');
  
  const canProceedStep1 = loanAmount >= loanConfig.minAmount && loanAmount <= loanConfig.maxAmount && loanPurpose;
  const canProceedStep2 = collateralType && (
    collateralType === 'crypto' 
      ? parseFloat(cryptoAmount) > 0 && maxLoanFromCrypto >= loanAmount && hasSufficientCrypto
      : parseFloat(collateralValue) > 0 && collateralDescription
  );
  const canSubmit = agreedToTerms;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createLoan.mutateAsync({
        amount: loanAmount,
        purpose: loanPurpose,
        term_months: loanTerm,
        interest_rate: interestRate,
        monthly_payment: monthlyPayment,
        collateral_type: collateralType as any,
        collateral_value: collateralType === 'crypto' ? cryptoUsdValue : parseFloat(collateralValue),
        collateral_description: collateralType === 'crypto' ? `${cryptoAmount} ${cryptoCurrency} locked` : collateralDescription,
        crypto_currency: collateralType === 'crypto' ? cryptoCurrency : null,
        crypto_amount: collateralType === 'crypto' ? parseFloat(cryptoAmount) : null,
        ltv_ratio: collateralType === 'crypto' ? loanConfig.cryptoLTV : null,
      });
      toast({ title: 'Application Submitted!', description: 'Your loan application has been submitted for review.' });
      navigate('/dashboard/loans');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit application', variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  const steps = [
    { number: 1, title: 'Loan Details' },
    { number: 2, title: 'Collateral' },
    { number: 3, title: 'Documents' },
    { number: 4, title: 'Review' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="sticky top-0 z-50 glass-effect border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-elegant"><Shield className="w-5 h-5 text-primary-foreground" /></div>
              <h1 className="text-lg font-serif font-bold text-foreground">SecureBank</h1>
            </Link>
            <Button variant="ghost" asChild><Link to="/dashboard"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Loan Application</h1>
          <p className="text-muted-foreground">Complete the form to apply for a collateral-backed loan</p>
        </div>

        <div className="mb-8 flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep > step.number ? 'bg-success text-success-foreground' : currentStep === step.number ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
              </div>
              {idx < steps.length - 1 && <div className={`flex-1 h-1 mx-4 rounded ${currentStep > step.number ? 'bg-success' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5 text-primary" />Loan Details</CardTitle>
                <div><Label>Loan Amount: ${loanAmount.toLocaleString()}</Label><Slider value={[loanAmount]} onValueChange={(val) => setLoanAmount(val[0])} min={loanConfig.minAmount} max={loanConfig.maxAmount} step={1000} className="mt-2" /></div>
                <div><Label>Loan Purpose</Label><Select value={loanPurpose} onValueChange={setLoanPurpose}><SelectTrigger className="mt-1"><SelectValue placeholder="Select purpose" /></SelectTrigger><SelectContent>{loanConfig.purposes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Loan Term: {loanTerm} months</Label><div className="grid grid-cols-6 gap-2 mt-2">{[6,12,24,36].map(t => <Button key={t} variant={loanTerm === t ? 'default' : 'outline'} size="sm" onClick={() => setLoanTerm(t)}>{t}mo</Button>)}</div></div>
                <Card className="bg-muted/50"><CardContent className="p-4"><div className="grid sm:grid-cols-2 gap-4"><div><p className="text-sm text-muted-foreground">Interest Rate</p><p className="text-xl font-bold text-primary">{interestRate}% APR</p></div><div><p className="text-sm text-muted-foreground">Monthly Payment</p><p className="text-xl font-bold">${monthlyPayment.toFixed(2)}</p></div></div></CardContent></Card>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />Collateral</CardTitle>
                <div className="grid sm:grid-cols-3 gap-3">
                  {loanConfig.collateralTypes.map(type => {
                    const Icon = collateralIcons[type.value];
                    return <button key={type.value} onClick={() => setCollateralType(type.value)} className={`p-4 rounded-lg border-2 text-left ${collateralType === type.value ? 'border-primary bg-primary/5' : 'border-border'}`}><Icon className="w-6 h-6 mb-2" /><p className="font-medium">{type.label}</p></button>;
                  })}
                </div>
                {collateralType === 'crypto' ? (
                  <div className="space-y-4">
                    <Alert className="border-warning bg-warning/10"><AlertTriangle className="h-4 w-4 text-warning" /><AlertTitle>Crypto Collateral Notice</AlertTitle><AlertDescription>Your crypto will be locked when the loan is approved. Max LTV: {loanConfig.cryptoLTV}%</AlertDescription></Alert>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><Label>Cryptocurrency</Label><Select value={cryptoCurrency} onValueChange={setCryptoCurrency}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{cryptoBalances?.map(c => <SelectItem key={c.currency} value={c.currency}>{c.icon} {c.name} ({c.amount.toFixed(4)})</SelectItem>)}</SelectContent></Select></div>
                      <div><Label>Amount to Lock</Label><Input type="number" step="0.0001" value={cryptoAmount} onChange={(e) => setCryptoAmount(e.target.value)} className="mt-1" /></div>
                    </div>
                    {parseFloat(cryptoAmount) > 0 && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-4 space-y-2">
                          <p className="text-sm text-muted-foreground">Collateral Value: ${cryptoUsdValue.toLocaleString()} | Max Loan: ${maxLoanFromCrypto.toLocaleString()}</p>
                          {!hasSufficientCrypto && (
                            <p className="text-sm text-destructive font-medium">
                              Insufficient balance. You have {userCryptoBalance?.amount?.toFixed(4) || 0} {cryptoCurrency} but trying to lock {cryptoAmount}.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : collateralType && (
                  <div className="space-y-4">
                    <div><Label>Estimated Value (USD)</Label><Input type="number" value={collateralValue} onChange={(e) => setCollateralValue(e.target.value)} className="mt-1" /></div>
                    <div><Label>Description</Label><Textarea value={collateralDescription} onChange={(e) => setCollateralDescription(e.target.value)} className="mt-1" /></div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-primary" />Documents</CardTitle>
                <CardDescription>Upload supporting documents (optional for demo)</CardDescription>
                <div className="border-2 border-dashed rounded-lg p-8 text-center"><Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Document upload skipped for demo</p></div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <CardTitle>Review Application</CardTitle>
                <Card className="bg-muted/50"><CardContent className="p-4 space-y-2"><p><strong>Amount:</strong> ${loanAmount.toLocaleString()}</p><p><strong>Purpose:</strong> {loanPurpose}</p><p><strong>Term:</strong> {loanTerm} months @ {interestRate}%</p><p><strong>Monthly:</strong> ${monthlyPayment.toFixed(2)}</p><p><strong>Collateral:</strong> {collateralType.replace('_', ' ')}</p></CardContent></Card>
                <div className="flex items-start gap-2"><Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(c) => setAgreedToTerms(!!c)} /><label htmlFor="terms" className="text-sm">I agree to the terms and conditions</label></div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep(s => s + 1)} disabled={(currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)}>Next<ArrowRight className="w-4 h-4 ml-2" /></Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="gradient-primary">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Submit Application</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LoanApplication;
