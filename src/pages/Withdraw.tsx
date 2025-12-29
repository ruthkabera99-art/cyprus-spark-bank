import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Bitcoin, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useCryptoBalances } from "@/hooks/useCryptoBalances";

const cryptoOptions = [
  { value: "BTC", label: "Bitcoin (BTC)", fee: "0.0005 BTC" },
  { value: "ETH", label: "Ethereum (ETH)", fee: "0.005 ETH" },
  { value: "USDT", label: "Tether (USDT)", fee: "1 USDT" },
];

const Withdraw = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: cryptoBalances, isLoading: cryptoLoading } = useCryptoBalances();
  
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [cryptoCurrency, setCryptoCurrency] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const isLoading = profileLoading || cryptoLoading;

  const handleTraditionalWithdraw = () => {
    if (!withdrawAmount || !bankName || !accountNumber || !routingNumber) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    if (amount > (profile?.traditional_balance || 0)) {
      toast({ title: "Insufficient Funds", description: "You don't have enough balance", variant: "destructive" });
      return;
    }

    toast({ title: "Withdrawal Initiated", description: `Your withdrawal of $${withdrawAmount} is being processed.` });
    setWithdrawAmount(""); setBankName(""); setAccountNumber(""); setRoutingNumber("");
  };

  const handleCryptoWithdraw = () => {
    if (!cryptoAmount || !cryptoCurrency || !walletAddress) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    toast({ title: "Crypto Withdrawal Initiated", description: `Your withdrawal of ${cryptoAmount} ${cryptoCurrency} is being processed.` });
    setCryptoAmount(""); setCryptoCurrency(""); setWalletAddress("");
  };

  const selectedCrypto = cryptoOptions.find(c => c.value === cryptoCurrency);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Withdraw Funds</h1>
          <p className="text-muted-foreground mb-8">Transfer money to your bank account or crypto wallet</p>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <Tabs defaultValue="traditional" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="traditional" className="flex items-center gap-2"><Building2 className="h-4 w-4" />Bank Transfer</TabsTrigger>
                <TabsTrigger value="crypto" className="flex items-center gap-2"><Bitcoin className="h-4 w-4" />Cryptocurrency</TabsTrigger>
              </TabsList>

              <TabsContent value="traditional">
                <Card>
                  <CardHeader><CardTitle>Bank Withdrawal</CardTitle><CardDescription>Transfer funds to your external bank account</CardDescription></CardHeader>
                  <CardContent className="space-y-6">
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Available Balance:</span>
                          <span className="text-xl font-bold text-foreground">${profile?.traditional_balance?.toLocaleString() || "0"}</span>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="space-y-2"><Label htmlFor="withdraw-amount">Withdrawal Amount (USD)</Label><Input id="withdraw-amount" type="number" placeholder="Enter amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="bank-name">Bank Name</Label><Input id="bank-name" placeholder="Enter your bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label htmlFor="routing">Routing Number</Label><Input id="routing" placeholder="9 digits" maxLength={9} value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} /></div>
                      <div className="space-y-2"><Label htmlFor="account">Account Number</Label><Input id="account" placeholder="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} /></div>
                    </div>
                    <Button onClick={handleTraditionalWithdraw} className="w-full">Initiate Withdrawal</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="crypto">
                <Card>
                  <CardHeader><CardTitle>Crypto Withdrawal</CardTitle><CardDescription>Send cryptocurrency to an external wallet</CardDescription></CardHeader>
                  <CardContent className="space-y-6">
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          {cryptoBalances?.map((crypto) => (
                            <div key={crypto.currency} className="flex justify-between items-center">
                              <span className="text-muted-foreground">{crypto.currency} Balance:</span>
                              <span className="font-semibold">{crypto.amount} {crypto.currency}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <div className="space-y-2"><Label>Select Cryptocurrency</Label><Select value={cryptoCurrency} onValueChange={setCryptoCurrency}><SelectTrigger><SelectValue placeholder="Select cryptocurrency" /></SelectTrigger><SelectContent>{cryptoOptions.map((crypto) => (<SelectItem key={crypto.value} value={crypto.value}>{crypto.label}</SelectItem>))}</SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="wallet-address">Destination Wallet Address</Label><Input id="wallet-address" placeholder="Enter wallet address" className="font-mono" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="crypto-amount">Amount</Label><Input id="crypto-amount" type="number" step="0.00000001" placeholder="Enter amount" value={cryptoAmount} onChange={(e) => setCryptoAmount(e.target.value)} /></div>
                    {selectedCrypto && (<Card className="bg-muted/50"><CardContent className="pt-4"><div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Network Fee:</span><span className="font-medium">{selectedCrypto.fee}</span></div></CardContent></Card>)}
                    <Card className="bg-amber-500/10 border-amber-500/20"><CardContent className="pt-4 flex gap-3"><AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" /><p className="text-sm text-amber-700 dark:text-amber-400"><strong>Warning:</strong> Double-check the wallet address. Crypto transactions are irreversible.</p></CardContent></Card>
                    <Button onClick={handleCryptoWithdraw} className="w-full">Initiate Crypto Withdrawal</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Withdraw;
