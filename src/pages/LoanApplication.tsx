import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  FileText, 
  Upload, 
  X, 
  Bitcoin,
  AlertTriangle,
  Calculator,
  Building2,
  Car,
  HardDrive,
  Coins,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  loanConfig, 
  calculateMonthlyPayment, 
  getCryptoPrice,
  type LoanApplication as LoanAppType,
  type CollateralDocument
} from '@/lib/mockData';

const collateralIcons: Record<string, React.ElementType> = {
  real_estate: Building2,
  vehicle: Car,
  equipment: HardDrive,
  crypto: Coins,
  other: Package,
};

const LoanApplication = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Form state
  const [loanAmount, setLoanAmount] = useState(10000);
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanTerm, setLoanTerm] = useState(12);
  const [collateralType, setCollateralType] = useState('');
  const [collateralValue, setCollateralValue] = useState('');
  const [collateralDescription, setCollateralDescription] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<CollateralDocument[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Crypto collateral state
  const [cryptoCurrency, setCryptoCurrency] = useState('BTC');
  const [cryptoAmount, setCryptoAmount] = useState('');

  if (!user) return null;

  const interestRate = loanConfig.baseInterestRates[loanTerm as keyof typeof loanConfig.baseInterestRates] || 8.0;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
  const totalPayment = monthlyPayment * loanTerm;
  const totalInterest = totalPayment - loanAmount;

  const selectedCollateralType = loanConfig.collateralTypes.find(c => c.value === collateralType);
  
  // Crypto calculations
  const cryptoPrice = getCryptoPrice(cryptoCurrency);
  const cryptoUsdValue = parseFloat(cryptoAmount || '0') * cryptoPrice;
  const maxLoanFromCrypto = cryptoUsdValue * (loanConfig.cryptoLTV / 100);
  const userCryptoBalance = user.cryptoBalances.find(c => c.symbol === cryptoCurrency);
  
  const canProceedStep1 = loanAmount >= loanConfig.minAmount && loanAmount <= loanConfig.maxAmount && loanPurpose;
  const canProceedStep2 = collateralType && (
    collateralType === 'crypto' 
      ? parseFloat(cryptoAmount) > 0 && maxLoanFromCrypto >= loanAmount
      : parseFloat(collateralValue) > 0 && collateralDescription
  );
  const canProceedStep3 = collateralType === 'crypto' || uploadedDocuments.length > 0 || true; // Allow skipping docs for demo
  const canSubmit = agreedToTerms;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newDocs: CollateralDocument[] = Array.from(files).map((file, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: file.name,
      type: file.type,
      uploadedAt: new Date().toISOString().split('T')[0],
    }));
    
    setUploadedDocuments(prev => [...prev, ...newDocs]);
    toast({ title: 'Files uploaded', description: `${files.length} document(s) uploaded successfully` });
  };

  const removeDocument = (docId: string) => {
    setUploadedDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleSubmit = () => {
    const newLoan: LoanAppType = {
      id: `loan-${Date.now()}`,
      userId: user.id,
      amount: loanAmount,
      purpose: loanPurpose,
      termMonths: loanTerm,
      interestRate,
      monthlyPayment,
      status: 'pending',
      applicationDate: new Date().toISOString().split('T')[0],
      collateralType: collateralType as LoanAppType['collateralType'],
      collateralValue: collateralType === 'crypto' ? cryptoUsdValue : parseFloat(collateralValue),
      collateralDescription: collateralType === 'crypto' 
        ? `${cryptoAmount} ${cryptoCurrency} locked as collateral`
        : collateralDescription,
      collateralDocuments: uploadedDocuments,
      ...(collateralType === 'crypto' && {
        cryptoCollateral: {
          currency: cryptoCurrency,
          amount: parseFloat(cryptoAmount),
          usdValueAtLock: cryptoUsdValue,
          currentUsdValue: cryptoUsdValue,
          ltv: loanConfig.cryptoLTV,
          liquidationThreshold: loanConfig.cryptoLiquidationThreshold,
        },
      }),
    };

    const updatedUser = {
      ...user,
      loanApplications: [...(user.loanApplications || []), newLoan],
    };
    updateUser(updatedUser);

    toast({
      title: 'Application Submitted!',
      description: 'Your loan application has been submitted for review.',
    });
    navigate('/dashboard/loans');
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const steps = [
    { number: 1, title: 'Loan Details', description: 'Amount & Terms' },
    { number: 2, title: 'Collateral', description: 'Asset Information' },
    { number: 3, title: 'Documents', description: 'Upload Files' },
    { number: 4, title: 'Review', description: 'Confirm & Submit' },
  ];

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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Loan Application</h1>
          <p className="text-muted-foreground">Complete the form below to apply for a collateral-backed loan</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep > step.number 
                      ? 'bg-success text-success-foreground' 
                      : currentStep === step.number 
                        ? 'gradient-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${currentStep > step.number ? 'bg-success' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            {/* Step 1: Loan Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-4">
                    <Calculator className="w-5 h-5 text-primary" />
                    Loan Details
                  </CardTitle>
                  <CardDescription>Choose your loan amount, purpose, and repayment term</CardDescription>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Loan Amount: ${loanAmount.toLocaleString()}</Label>
                    <Slider
                      value={[loanAmount]}
                      onValueChange={(val) => setLoanAmount(val[0])}
                      min={loanConfig.minAmount}
                      max={loanConfig.maxAmount}
                      step={1000}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Min: ${loanConfig.minAmount.toLocaleString()}</span>
                      <span>Max: ${loanConfig.maxAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Loan Purpose</Label>
                    <Select value={loanPurpose} onValueChange={setLoanPurpose}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {loanConfig.purposes.map(purpose => (
                          <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Loan Term: {loanTerm} months</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
                      {loanConfig.terms.map(term => (
                        <Button
                          key={term}
                          variant={loanTerm === term ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setLoanTerm(term)}
                        >
                          {term}mo
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Calculator */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Payment Summary
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Interest Rate</p>
                        <p className="text-xl font-bold text-primary">{interestRate}% APR</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Payment</p>
                        <p className="text-xl font-bold">${monthlyPayment.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="text-lg font-semibold text-warning">${totalInterest.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Repayment</p>
                        <p className="text-lg font-semibold">${totalPayment.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Collateral */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                    Collateral Information
                  </CardTitle>
                  <CardDescription>Select your collateral type and provide asset details</CardDescription>
                </div>

                <div>
                  <Label>Collateral Type</Label>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {loanConfig.collateralTypes.map(type => {
                      const Icon = collateralIcons[type.value];
                      return (
                        <button
                          key={type.value}
                          onClick={() => setCollateralType(type.value)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            collateralType === type.value 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mb-2 ${collateralType === type.value ? 'text-primary' : 'text-muted-foreground'}`} />
                          <p className="font-medium">{type.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {type.value === 'crypto' ? 'Use crypto as collateral' : `${type.documents.length} documents required`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {collateralType === 'crypto' ? (
                  <div className="space-y-4">
                    <Alert className="border-warning bg-warning/10">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <AlertTitle>Crypto Collateral Notice</AlertTitle>
                      <AlertDescription>
                        Your crypto will be locked as collateral. If the value drops below the liquidation threshold ({loanConfig.cryptoLiquidationThreshold}% LTV), 
                        your collateral may be liquidated to cover the loan.
                      </AlertDescription>
                    </Alert>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Cryptocurrency</Label>
                        <Select value={cryptoCurrency} onValueChange={setCryptoCurrency}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {user.cryptoBalances.map(crypto => (
                              <SelectItem key={crypto.symbol} value={crypto.symbol}>
                                {crypto.icon} {crypto.currency} ({crypto.balance.toFixed(4)} available)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="cryptoAmount">Amount to Lock</Label>
                        <Input
                          id="cryptoAmount"
                          type="number"
                          step="0.0001"
                          placeholder="0.00"
                          value={cryptoAmount}
                          onChange={(e) => setCryptoAmount(e.target.value)}
                          className="mt-1"
                        />
                        {userCryptoBalance && parseFloat(cryptoAmount) > userCryptoBalance.balance && (
                          <p className="text-xs text-destructive mt-1">Insufficient balance</p>
                        )}
                      </div>
                    </div>

                    {parseFloat(cryptoAmount) > 0 && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Bitcoin className="w-4 h-4" />
                            Crypto Collateral Summary
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Current {cryptoCurrency} Price</p>
                              <p className="text-lg font-bold">${cryptoPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Collateral Value</p>
                              <p className="text-lg font-bold">${cryptoUsdValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Loan-to-Value (LTV)</p>
                              <p className="text-lg font-bold text-primary">{loanConfig.cryptoLTV}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Max Loan Amount</p>
                              <p className={`text-lg font-bold ${maxLoanFromCrypto >= loanAmount ? 'text-success' : 'text-destructive'}`}>
                                ${maxLoanFromCrypto.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {maxLoanFromCrypto < loanAmount && (
                            <Alert className="mt-4 border-destructive bg-destructive/10">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Your collateral value is insufficient for the requested loan amount. 
                                Either increase collateral or reduce loan amount to ${maxLoanFromCrypto.toFixed(0)}.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : collateralType && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="collateralValue">Estimated Collateral Value ($)</Label>
                      <Input
                        id="collateralValue"
                        type="number"
                        placeholder="Enter estimated value"
                        value={collateralValue}
                        onChange={(e) => setCollateralValue(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="collateralDescription">Collateral Description</Label>
                      <Textarea
                        id="collateralDescription"
                        placeholder="Describe your collateral asset (e.g., Property address, vehicle make/model/year)"
                        value={collateralDescription}
                        onChange={(e) => setCollateralDescription(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    Document Upload
                  </CardTitle>
                  <CardDescription>Upload supporting documents for your collateral</CardDescription>
                </div>

                {collateralType === 'crypto' ? (
                  <Alert className="border-success bg-success/10">
                    <Check className="h-4 w-4 text-success" />
                    <AlertTitle>No Documents Required</AlertTitle>
                    <AlertDescription>
                      Crypto collateral is verified automatically. Your {cryptoCurrency} will be locked upon approval.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {selectedCollateralType && selectedCollateralType.documents.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Required Documents:</h4>
                        <ul className="space-y-1">
                          {selectedCollateralType.documents.map((doc, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className={`w-4 h-4 ${uploadedDocuments.some(d => d.name.toLowerCase().includes(doc.toLowerCase().split(' ')[0])) ? 'text-success' : 'text-muted-foreground/50'}`} />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="font-medium mb-2">Drag and drop files here, or click to browse</p>
                      <p className="text-sm text-muted-foreground mb-4">Supported formats: PDF, JPG, PNG (Max 10MB each)</p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button asChild variant="outline">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Select Files
                        </label>
                      </Button>
                    </div>

                    {uploadedDocuments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Uploaded Documents ({uploadedDocuments.length})</h4>
                        {uploadedDocuments.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-medium text-sm">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">Uploaded {doc.uploadedAt}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeDocument(doc.id)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-4">
                    <Check className="w-5 h-5 text-primary" />
                    Review & Submit
                  </CardTitle>
                  <CardDescription>Review your application details before submitting</CardDescription>
                </div>

                <div className="grid gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">Loan Details</h4>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Amount:</span> <strong>${loanAmount.toLocaleString()}</strong></div>
                        <div><span className="text-muted-foreground">Purpose:</span> <strong>{loanPurpose}</strong></div>
                        <div><span className="text-muted-foreground">Term:</span> <strong>{loanTerm} months</strong></div>
                        <div><span className="text-muted-foreground">Interest Rate:</span> <strong>{interestRate}% APR</strong></div>
                        <div><span className="text-muted-foreground">Monthly Payment:</span> <strong>${monthlyPayment.toFixed(2)}</strong></div>
                        <div><span className="text-muted-foreground">Total Repayment:</span> <strong>${totalPayment.toFixed(2)}</strong></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">Collateral Information</h4>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Type:</span> <strong>{selectedCollateralType?.label}</strong></div>
                        <div><span className="text-muted-foreground">Value:</span> <strong>${(collateralType === 'crypto' ? cryptoUsdValue : parseFloat(collateralValue || '0')).toLocaleString()}</strong></div>
                        <div className="sm:col-span-2">
                          <span className="text-muted-foreground">Description:</span> 
                          <strong className="block mt-1">
                            {collateralType === 'crypto' 
                              ? `${cryptoAmount} ${cryptoCurrency} locked as collateral`
                              : collateralDescription}
                          </strong>
                        </div>
                        {collateralType !== 'crypto' && (
                          <div className="sm:col-span-2">
                            <span className="text-muted-foreground">Documents:</span> <strong>{uploadedDocuments.length} file(s) uploaded</strong>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a>, 
                    <a href="#" className="text-primary hover:underline"> Loan Agreement</a>, and authorize SecureBank 
                    to verify my collateral information. I understand that my collateral may be seized if I default on the loan.
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button 
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2) ||
                    (currentStep === 3 && !canProceedStep3)
                  }
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="gradient-primary"
                >
                  <Check className="w-4 h-4 mr-2" /> Submit Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LoanApplication;
