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
import { Building2, Bitcoin, Copy, CheckCircle2, Loader2, Clock, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useAuth } from "@/contexts/AuthContext";

const cryptoWallets = {
  BTC: {
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    name: "Bitcoin",
    icon: "₿",
    color: "text-orange-500",
  },
  ETH: {
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    name: "Ethereum",
    icon: "Ξ",
    color: "text-blue-500",
  },
  USDT: {
    address: "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",
    name: "Tether (TRC-20)",
    icon: "₮",
    color: "text-green-500",
  },
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

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
    setTimeout(() => setCopiedAddress(null), 3000);
  };

  const handleTraditionalDeposit = async () => {
    if (!depositAmount || !depositMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create deposit REQUEST with pending status - NO balance update
      await createTransaction.mutateAsync({
        type: 'deposit',
        category: 'traditional',
        currency: 'USD',
        amount: amount,
        status: 'pending', // Always pending - needs admin approval
        description: `${depositMethod === 'wire' ? 'Wire Transfer' : depositMethod === 'ach' ? 'ACH Transfer' : 'Check'} Deposit Request`,
        reference_id: `DEP-REQ-${Date.now()}`,
        recipient_address: null,
        network_fee: null,
      });

      setRequestSubmitted(true);
      toast({
        title: "Deposit Request Submitted",
        description: "Your deposit request is pending admin approval. You will be notified once approved.",
      });
      setDepositAmount("");
      setDepositMethod("");
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoDeposit = async () => {
    if (!cryptoDepositAmount) {
      toast({
        title: "Missing Amount",
        description: "Please enter the amount you deposited",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(cryptoDepositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create crypto deposit REQUEST with pending status - NO balance update
      await createTransaction.mutateAsync({
        type: 'deposit',
        category: 'crypto',
        currency: selectedCrypto,
        amount: amount,
        status: 'pending', // Always pending - needs admin approval
        description: `${cryptoWallets[selectedCrypto].name} Deposit Request`,
        reference_id: `CDEP-REQ-${Date.now()}`,
        recipient_address: cryptoWallets[selectedCrypto].address,
        network_fee: null,
      });

      setRequestSubmitted(true);
      toast({
        title: "Crypto Deposit Request Submitted",
        description: "Your deposit request is pending admin approval and network confirmation.",
      });
      setCryptoDepositAmount("");
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Deposit Funds</h1>
          <p className="text-muted-foreground mb-8">Request a deposit - admin approval required</p>

          {/* Pending Notice */}
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
                Your deposit request has been submitted and is pending admin approval. You can track the status in your Activity History.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="traditional" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="traditional" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Traditional
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                Cryptocurrency
              </TabsTrigger>
            </TabsList>

            <TabsContent value="traditional">
              <Card>
                <CardHeader>
                  <CardTitle>Bank Transfer Deposit Request</CardTitle>
                  <CardDescription>Submit a deposit request for admin approval</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Deposit Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="method">Deposit Method</Label>
                    <Select value={depositMethod} onValueChange={setDepositMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select deposit method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wire">Wire Transfer</SelectItem>
                        <SelectItem value="ach">ACH Transfer</SelectItem>
                        <SelectItem value="check">Check Deposit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {depositMethod && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <h4 className="font-semibold mb-3">Bank Details for Transfer</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bank Name:</span>
                            <span className="font-medium">NexusBank International</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Routing Number:</span>
                            <span className="font-medium">021000021</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Account Number:</span>
                            <span className="font-medium">1234567890</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">SWIFT Code:</span>
                            <span className="font-medium">NXBKUS33XXX</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                          After making the transfer, submit your request below. Admin will verify and approve.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Button onClick={handleTraditionalDeposit} className="w-full" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Submit Deposit Request
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

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
                        <button
                          key={crypto}
                          onClick={() => setSelectedCrypto(crypto)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedCrypto === crypto
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className={`text-2xl font-bold ${cryptoWallets[crypto].color}`}>
                            {cryptoWallets[crypto].icon}
                          </div>
                          <div className="text-sm font-medium mt-1">{crypto}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Your {cryptoWallets[selectedCrypto].name} Deposit Address</Label>
                    
                    {/* QR Code Placeholder */}
                    <div className="flex justify-center p-6 bg-white rounded-lg">
                      <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className={`text-4xl ${cryptoWallets[selectedCrypto].color}`}>
                            {cryptoWallets[selectedCrypto].icon}
                          </div>
                          <p className="text-xs text-gray-600 mt-2">QR Code</p>
                        </div>
                      </div>
                    </div>

                    {/* Wallet Address */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={cryptoWallets[selectedCrypto].address}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(cryptoWallets[selectedCrypto].address)}
                      >
                        {copiedAddress === cryptoWallets[selectedCrypto].address ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Crypto Deposit Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="cryptoAmount">Amount Sent ({selectedCrypto})</Label>
                    <Input
                      id="cryptoAmount"
                      type="number"
                      step="0.00000001"
                      placeholder={`Enter ${selectedCrypto} amount sent`}
                      value={cryptoDepositAmount}
                      onChange={(e) => setCryptoDepositAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the amount you sent. Admin will verify the transaction on the network.
                    </p>
                  </div>

                  <Card className="bg-amber-500/10 border-amber-500/20">
                    <CardContent className="pt-4">
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        <strong>Important:</strong> Only send {cryptoWallets[selectedCrypto].name} ({selectedCrypto}) to this address. 
                        Your deposit will be credited after admin verification and network confirmation.
                      </p>
                    </CardContent>
                  </Card>

                  <Button onClick={handleCryptoDeposit} className="w-full" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Submit Crypto Deposit Request
                      </>
                    )}
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
