import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Building2, Bitcoin, Copy, CheckCircle2, Loader2, Clock, Info, CreditCard, Lock, Wallet, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useAuth } from "@/contexts/AuthContext";

const cryptoWallets = {
  BTC: { address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", name: "Bitcoin", icon: "₿", color: "text-orange-500" },
  ETH: { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", name: "Ethereum", icon: "Ξ", color: "text-blue-500" },
  USDT: { address: "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9", name: "Tether (TRC-20)", icon: "₮", color: "text-green-500" },
};

const Deposit = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const createTransaction = useCreateTransaction();

  const [selectedCrypto, setSelectedCrypto] = useState<keyof typeof cryptoWallets>("BTC");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cryptoDepositAmount, setCryptoDepositAmount] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Credit card state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardAmount, setCardAmount] = useState("");

  // Digital wallet state
  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletEmail, setWalletEmail] = useState("");

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const getCardType = (number: string) => {
    const digits = number.replace(/\s/g, '');
    if (digits.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard';
    if (/^3[47]/.test(digits)) return 'AMEX';
    if (digits.startsWith('6')) return 'Discover';
    return '';
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast({ title: "Address Copied", description: "Wallet address copied to clipboard" });
    setTimeout(() => setCopiedAddress(null), 3000);
  };

  const methodLabels: Record<string, string> = {
    wire: 'Wire Transfer', ach: 'ACH Transfer', check: 'Check Deposit', swift: 'SWIFT Transfer',
    sepa: 'SEPA Transfer', iban: 'IBAN Transfer', rtgs: 'RTGS', neft: 'NEFT Transfer',
    imps: 'IMPS', fedwire: 'Fedwire', chaps: 'CHAPS', bacs: 'BACS Transfer',
    eft: 'EFT', interac: 'Interac e-Transfer', fps: 'Faster Payments', upi: 'UPI Transfer',
    pix: 'PIX Transfer', cash_deposit: 'Cash Deposit', money_order: 'Money Order',
    cashiers_check: "Cashier's Check", direct_deposit: 'Direct Deposit', correspondent: 'Correspondent Bank Transfer',
  };

  const handleTraditionalDeposit = async () => {
    if (!depositAmount || !depositMethod) {
      toast({ title: "Missing Information", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid deposit amount", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await createTransaction.mutateAsync({
        type: 'deposit', category: 'traditional', currency: 'USD', amount,
        status: 'pending',
        description: `${methodLabels[depositMethod] || depositMethod} Deposit Request`,
        reference_id: `DEP-REQ-${Date.now()}`, recipient_address: null, network_fee: null,
      });
      setRequestSubmitted(true);
      toast({ title: "Deposit Request Submitted", description: "Your deposit request is pending admin approval." });
      setDepositAmount(""); setDepositMethod("");
    } catch (error) {
      toast({ title: "Request Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreditCardDeposit = async () => {
    const digits = cardNumber.replace(/\s/g, '');
    if (!cardHolderName || digits.length < 15 || !cardExpiry || cardCvv.length < 3 || !cardAmount) {
      toast({ title: "Missing Information", description: "Please fill in all card details correctly", variant: "destructive" });
      return;
    }
    const amount = parseFloat(cardAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    if (amount > 50000) {
      toast({ title: "Limit Exceeded", description: "Maximum credit card deposit is $50,000 per transaction", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const cardType = getCardType(cardNumber);
      const lastFour = digits.slice(-4);
      await createTransaction.mutateAsync({
        type: 'deposit', category: 'traditional', currency: 'USD', amount,
        status: 'pending',
        description: `Credit Card Deposit (${cardType} ****${lastFour})`,
        reference_id: `CC-DEP-${Date.now()}`, recipient_address: null, network_fee: null,
      });
      setRequestSubmitted(true);
      toast({ title: "Credit Card Deposit Submitted", description: "Your deposit is being processed and pending admin approval." });
      setCardNumber(""); setCardExpiry(""); setCardCvv(""); setCardHolderName(""); setCardAmount("");
    } catch (error) {
      toast({ title: "Request Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoDeposit = async () => {
    if (!cryptoDepositAmount) {
      toast({ title: "Missing Amount", description: "Please enter the amount you deposited", variant: "destructive" });
      return;
    }
    const amount = parseFloat(cryptoDepositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid deposit amount", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await createTransaction.mutateAsync({
        type: 'deposit', category: 'crypto', currency: selectedCrypto, amount,
        status: 'pending',
        description: `${cryptoWallets[selectedCrypto].name} Deposit Request`,
        reference_id: `CDEP-REQ-${Date.now()}`, recipient_address: cryptoWallets[selectedCrypto].address, network_fee: null,
      });
      setRequestSubmitted(true);
      toast({ title: "Crypto Deposit Request Submitted", description: "Your deposit request is pending admin approval." });
      setCryptoDepositAmount("");
    } catch (error) {
      toast({ title: "Request Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return null;

  const cardType = getCardType(cardNumber);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Deposit Funds</h1>
          <p className="text-muted-foreground mb-8">Request a deposit - admin approval required</p>

          <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-700">Deposit Requests Require Approval</AlertTitle>
            <AlertDescription className="text-amber-600">
              All deposit requests are reviewed and approved by our admin team. Your balance will be updated once approved.
            </AlertDescription>
          </Alert>

          {requestSubmitted && (
            <Alert className="mb-6 border-green-500/50 bg-green-500/10">
              <Clock className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">Request Submitted Successfully!</AlertTitle>
              <AlertDescription className="text-green-600">
                Your deposit request has been submitted and is pending admin approval.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="traditional" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="traditional" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Bank Transfer
              </TabsTrigger>
              <TabsTrigger value="creditcard" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Credit Card
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                Crypto
              </TabsTrigger>
            </TabsList>

            {/* Bank Transfer Tab */}
            <TabsContent value="traditional">
              <Card>
                <CardHeader>
                  <CardTitle>Bank Transfer Deposit Request</CardTitle>
                  <CardDescription>Submit a deposit request for admin approval</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Deposit Amount (USD)</Label>
                    <Input id="amount" type="number" placeholder="Enter amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method">Deposit Method</Label>
                    <Select value={depositMethod} onValueChange={setDepositMethod}>
                      <SelectTrigger><SelectValue placeholder="Select deposit method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wire">Wire Transfer</SelectItem>
                        <SelectItem value="ach">ACH Transfer</SelectItem>
                        <SelectItem value="check">Check Deposit</SelectItem>
                        <SelectItem value="swift">SWIFT Transfer</SelectItem>
                        <SelectItem value="sepa">SEPA Transfer</SelectItem>
                        <SelectItem value="iban">IBAN Transfer</SelectItem>
                        <SelectItem value="rtgs">RTGS (Real-Time Gross Settlement)</SelectItem>
                        <SelectItem value="neft">NEFT Transfer</SelectItem>
                        <SelectItem value="imps">IMPS (Immediate Payment Service)</SelectItem>
                        <SelectItem value="fedwire">Fedwire Transfer</SelectItem>
                        <SelectItem value="chaps">CHAPS (UK Clearing House)</SelectItem>
                        <SelectItem value="bacs">BACS Transfer</SelectItem>
                        <SelectItem value="eft">EFT (Electronic Funds Transfer)</SelectItem>
                        <SelectItem value="interac">Interac e-Transfer</SelectItem>
                        <SelectItem value="fps">Faster Payments (FPS)</SelectItem>
                        <SelectItem value="upi">UPI Transfer</SelectItem>
                        <SelectItem value="pix">PIX Transfer (Brazil)</SelectItem>
                        <SelectItem value="cash_deposit">Cash Deposit at Branch</SelectItem>
                        <SelectItem value="money_order">Money Order</SelectItem>
                        <SelectItem value="cashiers_check">Cashier's Check</SelectItem>
                        <SelectItem value="direct_deposit">Direct Deposit / Payroll</SelectItem>
                        <SelectItem value="correspondent">Correspondent Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {depositMethod && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <h4 className="font-semibold mb-3">Bank Details for Transfer</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Bank Name:</span><span className="font-medium">MorganFinance International</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Routing Number:</span><span className="font-medium">021000021</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Account Number:</span><span className="font-medium">1234567890</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">SWIFT Code:</span><span className="font-medium">MFBKUS33XXX</span></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">After making the transfer, submit your request below.</p>
                      </CardContent>
                    </Card>
                  )}
                  <Button onClick={handleTraditionalDeposit} className="w-full" disabled={isProcessing}>
                    {isProcessing ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>) : (<><Clock className="mr-2 h-4 w-4" />Submit Deposit Request</>)}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Credit Card Tab */}
            <TabsContent value="creditcard">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Credit Card Deposit
                  </CardTitle>
                  <CardDescription>Deposit instantly using Visa, Mastercard, or AMEX</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Card Preview */}
                  <div className="relative bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.7)] rounded-2xl p-6 text-primary-foreground shadow-lg overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <div className="flex justify-between items-start mb-8">
                      <div className="text-xs font-medium opacity-80">MorganFinance Bank</div>
                      <div className="text-lg font-bold">{cardType || 'CARD'}</div>
                    </div>
                    <div className="font-mono text-xl tracking-[0.2em] mb-6">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-[10px] opacity-60 uppercase">Card Holder</div>
                        <div className="text-sm font-medium">{cardHolderName || 'YOUR NAME'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] opacity-60 uppercase">Expires</div>
                        <div className="text-sm font-medium">{cardExpiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardHolderName">Cardholder Name</Label>
                    <Input id="cardHolderName" placeholder="Name on card" value={cardHolderName} onChange={(e) => setCardHolderName(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      className="font-mono tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Expiry Date</Label>
                      <Input id="cardExpiry" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input id="cardCvv" type="password" placeholder="•••" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardAmount">Deposit Amount (USD)</Label>
                    <Input id="cardAmount" type="number" placeholder="Enter amount" value={cardAmount} onChange={(e) => setCardAmount(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Maximum $50,000 per transaction</p>
                  </div>

                  {/* Accepted cards */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Accepted:</span>
                    {['VISA', 'Mastercard', 'AMEX'].map(card => (
                      <span key={card} className={`text-xs font-bold px-2 py-1 rounded ${cardType === card ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {card}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5 text-green-500" />
                    <span>Secured with 256-bit SSL encryption • PCI DSS Level 1 compliant</span>
                  </div>

                  <Button onClick={handleCreditCardDeposit} className="w-full" disabled={isProcessing}>
                    {isProcessing ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>) : (<><CreditCard className="mr-2 h-4 w-4" />Deposit {cardAmount ? `$${parseFloat(cardAmount).toFixed(2)}` : ''}</>)}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Crypto Tab */}
            <TabsContent value="crypto">
              <Card>
                <CardHeader>
                  <CardTitle>Crypto Deposit Request</CardTitle>
                  <CardDescription>Send cryptocurrency and submit a deposit request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Select Cryptocurrency</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {(Object.keys(cryptoWallets) as Array<keyof typeof cryptoWallets>).map((crypto) => (
                        <button key={crypto} onClick={() => setSelectedCrypto(crypto)} className={`p-4 rounded-lg border-2 transition-all ${selectedCrypto === crypto ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                          <div className={`text-2xl font-bold ${cryptoWallets[crypto].color}`}>{cryptoWallets[crypto].icon}</div>
                          <div className="text-sm font-medium mt-1">{crypto}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Your {cryptoWallets[selectedCrypto].name} Deposit Address</Label>
                    <div className="flex justify-center p-6 bg-white rounded-lg">
                      <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className={`text-4xl ${cryptoWallets[selectedCrypto].color}`}>{cryptoWallets[selectedCrypto].icon}</div>
                          <p className="text-xs text-gray-600 mt-2">QR Code</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input value={cryptoWallets[selectedCrypto].address} readOnly className="font-mono text-sm" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(cryptoWallets[selectedCrypto].address)}>
                        {copiedAddress === cryptoWallets[selectedCrypto].address ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cryptoAmount">Amount Sent ({selectedCrypto})</Label>
                    <Input id="cryptoAmount" type="number" step="0.00000001" placeholder={`Enter ${selectedCrypto} amount sent`} value={cryptoDepositAmount} onChange={(e) => setCryptoDepositAmount(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Enter the amount you sent. Admin will verify the transaction.</p>
                  </div>

                  <Card className="bg-amber-500/10 border-amber-500/20">
                    <CardContent className="pt-4">
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        <strong>Important:</strong> Only send {cryptoWallets[selectedCrypto].name} ({selectedCrypto}) to this address.
                      </p>
                    </CardContent>
                  </Card>

                  <Button onClick={handleCryptoDeposit} className="w-full" disabled={isProcessing}>
                    {isProcessing ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>) : (<><Clock className="mr-2 h-4 w-4" />Submit Crypto Deposit Request</>)}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Deposit;
