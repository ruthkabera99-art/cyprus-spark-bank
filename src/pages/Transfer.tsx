import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Bitcoin, Send, Loader2, AlertCircle, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useCryptoBalances, useUpdateCryptoBalance } from "@/hooks/useCryptoBalances";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { countries, getBanksByCountry } from "@/lib/internationalBanks";

const Transfer = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: cryptoBalances } = useCryptoBalances();
  const updateCryptoBalance = useUpdateCryptoBalance();
  const createTransaction = useCreateTransaction();

  // Traditional transfer state
  const [recipientEmail, setRecipientEmail] = useState("");
  const [traditionalAmount, setTraditionalAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // International transfer state
  const [intlCountry, setIntlCountry] = useState("");
  const [intlBank, setIntlBank] = useState("");
  const [intlSwiftCode, setIntlSwiftCode] = useState("");
  const [intlAccountNumber, setIntlAccountNumber] = useState("");
  const [intlBeneficiaryName, setIntlBeneficiaryName] = useState("");
  const [intlAmount, setIntlAmount] = useState("");
  const [intlCurrency, setIntlCurrency] = useState("USD");
  const [intlDescription, setIntlDescription] = useState("");
  const [intlIban, setIntlIban] = useState("");

  // Crypto transfer state
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [cryptoDescription, setCryptoDescription] = useState("");

  const traditionalBalance = profile?.traditional_balance || 0;

  const banksForCountry = useMemo(() => {
    return intlCountry ? getBanksByCountry(intlCountry) : [];
  }, [intlCountry]);

  const handleBankSelect = (bankName: string) => {
    setIntlBank(bankName);
    const bank = banksForCountry.find(b => b.name === bankName);
    if (bank) {
      setIntlSwiftCode(bank.swiftCode);
    }
  };

  const handleTraditionalTransfer = async () => {
    if (!recipientEmail || !traditionalAmount) {
      toast({ title: "Missing Information", description: "Please fill in recipient email and amount", variant: "destructive" });
      return;
    }
    const amount = parseFloat(traditionalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    if (amount > traditionalBalance) {
      toast({ title: "Insufficient Funds", description: "You don't have enough balance for this transfer", variant: "destructive" });
      return;
    }

    setIsTransferring(true);
    try {
      const { data: recipientProfile, error: recipientError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', recipientEmail.toLowerCase().trim())
        .maybeSingle();
      if (recipientError) throw recipientError;
      if (!recipientProfile) {
        toast({ title: "Recipient Not Found", description: "No user found with that email address", variant: "destructive" });
        setIsTransferring(false);
        return;
      }
      if (recipientProfile.id === profile?.id) {
        toast({ title: "Invalid Transfer", description: "You cannot transfer to yourself", variant: "destructive" });
        setIsTransferring(false);
        return;
      }

      const referenceId = `TRF-${Date.now()}`;
      await createTransaction.mutateAsync({
        type: 'transfer', category: 'traditional', currency: 'USD', amount,
        status: 'completed',
        description: description || `Transfer to ${recipientProfile.full_name || recipientEmail}`,
        recipient_address: recipientEmail, reference_id: referenceId, network_fee: null,
      });

      const { error: senderUpdateError } = await supabase
        .from('profiles')
        .update({ traditional_balance: traditionalBalance - amount })
        .eq('id', profile?.id);
      if (senderUpdateError) throw senderUpdateError;

      const { data: recipientCurrentProfile } = await supabase
        .from('profiles')
        .select('traditional_balance')
        .eq('id', recipientProfile.id)
        .single();
      const recipientCurrentBalance = recipientCurrentProfile?.traditional_balance || 0;
      const { error: recipientUpdateError } = await supabase
        .from('profiles')
        .update({ traditional_balance: recipientCurrentBalance + amount })
        .eq('id', recipientProfile.id);
      if (recipientUpdateError) throw recipientUpdateError;

      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({ title: "Transfer Successful", description: `$${amount.toFixed(2)} sent to ${recipientProfile.full_name || recipientEmail}` });
      setRecipientEmail(""); setTraditionalAmount(""); setDescription("");
    } catch (error: any) {
      toast({ title: "Transfer Failed", description: error.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleInternationalTransfer = async () => {
    if (!intlBeneficiaryName || !intlAmount || !intlSwiftCode || !intlAccountNumber) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    const amount = parseFloat(intlAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    if (amount > traditionalBalance) {
      toast({ title: "Insufficient Funds", description: "You don't have enough balance", variant: "destructive" });
      return;
    }

    setIsTransferring(true);
    try {
      const referenceId = `INTL-${Date.now()}`;
      await createTransaction.mutateAsync({
        type: 'transfer', category: 'traditional', currency: intlCurrency, amount,
        status: 'pending',
        description: intlDescription || `International transfer to ${intlBeneficiaryName} via ${intlBank || 'SWIFT'}`,
        recipient_address: `SWIFT:${intlSwiftCode}|ACCT:${intlAccountNumber}${intlIban ? `|IBAN:${intlIban}` : ''}`,
        reference_id: referenceId, network_fee: null,
      });

      toast({ title: "International Transfer Submitted", description: "Your transfer is pending review. International transfers typically take 1-5 business days." });
      setIntlCountry(""); setIntlBank(""); setIntlSwiftCode(""); setIntlAccountNumber("");
      setIntlBeneficiaryName(""); setIntlAmount(""); setIntlDescription(""); setIntlIban("");
    } catch (error: any) {
      toast({ title: "Transfer Failed", description: error.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleCryptoTransfer = async () => {
    if (!selectedCrypto || !cryptoAmount || !walletAddress) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    const amount = parseFloat(cryptoAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    const cryptoBalance = cryptoBalances?.find(b => b.currency === selectedCrypto);
    const networkFee = selectedCrypto === 'BTC' ? 0.0001 : selectedCrypto === 'ETH' ? 0.002 : 1;
    const totalRequired = amount + networkFee;
    if (!cryptoBalance || totalRequired > (cryptoBalance.amount || 0)) {
      toast({ title: "Insufficient Balance", description: `You need ${totalRequired} ${selectedCrypto} but only have ${cryptoBalance?.amount || 0}`, variant: "destructive" });
      return;
    }

    setIsTransferring(true);
    try {
      await createTransaction.mutateAsync({
        type: 'transfer', category: 'crypto', currency: selectedCrypto, amount,
        status: 'pending',
        description: cryptoDescription || `${selectedCrypto} transfer to external wallet`,
        recipient_address: walletAddress, reference_id: `CTRF-${Date.now()}`, network_fee: networkFee,
      });
      await updateCryptoBalance.mutateAsync({
        currency: selectedCrypto, amount: (cryptoBalance.amount || 0) - totalRequired,
      });
      toast({ title: "Transfer Initiated", description: `${amount} ${selectedCrypto} transfer is being processed` });
      setSelectedCrypto(""); setCryptoAmount(""); setWalletAddress(""); setCryptoDescription("");
    } catch (error: any) {
      toast({ title: "Transfer Failed", description: error.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Transfer Funds</h1>
          <p className="text-muted-foreground mb-8">Send money domestically, internationally, or via cryptocurrency</p>

          <Tabs defaultValue="traditional" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="traditional" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                To User
              </TabsTrigger>
              <TabsTrigger value="international" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                International
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                Crypto
              </TabsTrigger>
            </TabsList>

            {/* Domestic Transfer */}
            <TabsContent value="traditional">
              <Card>
                <CardHeader>
                  <CardTitle>Send to Another User</CardTitle>
                  <CardDescription>Transfer USD to another MorganFinance Bank user by email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Available Balance</span>
                        <span className="text-xl font-bold text-primary">
                          ${traditionalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="space-y-2">
                    <Label htmlFor="recipientEmail">Recipient Email</Label>
                    <Input id="recipientEmail" type="email" placeholder="recipient@email.com" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input id="amount" type="number" placeholder="0.00" value={traditionalAmount} onChange={(e) => setTraditionalAmount(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea id="description" placeholder="What's this transfer for?" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                  </div>
                  <Button onClick={handleTraditionalTransfer} className="w-full" disabled={isTransferring}>
                    {isTransferring ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>) : (<><Send className="mr-2 h-4 w-4" />Send Transfer</>)}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* International Transfer */}
            <TabsContent value="international">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    International Wire Transfer
                  </CardTitle>
                  <CardDescription>Send funds to any bank worldwide via SWIFT network</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Available Balance</span>
                        <span className="text-xl font-bold text-primary">
                          ${traditionalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Country Selection */}
                  <div className="space-y-2">
                    <Label>Destination Country</Label>
                    <Select value={intlCountry} onValueChange={(v) => { setIntlCountry(v); setIntlBank(""); setIntlSwiftCode(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>
                        {countries.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bank Selection */}
                  {intlCountry && (
                    <div className="space-y-2">
                      <Label>Recipient Bank</Label>
                      <Select value={intlBank} onValueChange={handleBankSelect}>
                        <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                        <SelectContent>
                          {banksForCountry.map(b => (
                            <SelectItem key={b.swiftCode} value={b.name}>
                              {b.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="__other">Other (enter SWIFT manually)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* SWIFT / BIC Code */}
                  <div className="space-y-2">
                    <Label htmlFor="swiftCode">SWIFT / BIC Code</Label>
                    <Input
                      id="swiftCode"
                      placeholder="e.g. CHASUS33"
                      value={intlSwiftCode}
                      onChange={(e) => setIntlSwiftCode(e.target.value.toUpperCase())}
                      maxLength={11}
                      className="font-mono uppercase tracking-wider"
                      readOnly={intlBank !== "__other" && intlBank !== ""}
                    />
                    <p className="text-xs text-muted-foreground">8 or 11 character SWIFT/BIC code identifying the recipient bank</p>
                  </div>

                  {/* Beneficiary Details */}
                  <div className="space-y-2">
                    <Label htmlFor="beneficiaryName">Beneficiary Full Name</Label>
                    <Input id="beneficiaryName" placeholder="Full name as on bank account" value={intlBeneficiaryName} onChange={(e) => setIntlBeneficiaryName(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="intlAccountNumber">Account Number</Label>
                      <Input id="intlAccountNumber" placeholder="Recipient account number" value={intlAccountNumber} onChange={(e) => setIntlAccountNumber(e.target.value)} className="font-mono" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="intlIban">IBAN (if applicable)</Label>
                      <Input id="intlIban" placeholder="e.g. GB29NWBK60161331926819" value={intlIban} onChange={(e) => setIntlIban(e.target.value.toUpperCase())} className="font-mono uppercase" />
                    </div>
                  </div>

                  {/* Amount & Currency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="intlAmount">Amount</Label>
                      <Input id="intlAmount" type="number" placeholder="0.00" value={intlAmount} onChange={(e) => setIntlAmount(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select value={intlCurrency} onValueChange={setIntlCurrency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["USD", "EUR", "GBP", "CHF", "JPY", "AUD", "CAD", "SGD", "AED", "INR", "CNY", "BRL", "ZAR", "NGN", "KES", "GHS", "MXN", "TRY", "SAR", "QAR", "EGP", "MYR", "THB", "IDR", "VND", "PKR", "KRW", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "PHP", "TZS"].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="intlDescription">Purpose / Reference (optional)</Label>
                    <Textarea id="intlDescription" placeholder="e.g. Invoice payment, Family support" value={intlDescription} onChange={(e) => setIntlDescription(e.target.value)} rows={2} />
                  </div>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-4 flex gap-3">
                      <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">International Transfer Info</p>
                        <ul className="mt-1 space-y-1 list-disc list-inside">
                          <li>Processing time: 1–5 business days via SWIFT</li>
                          <li>International transfers are subject to admin review</li>
                          <li>Intermediary bank fees may apply</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Button onClick={handleInternationalTransfer} className="w-full" disabled={isTransferring}>
                    {isTransferring ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>) : (<><Globe className="mr-2 h-4 w-4" />Send International Transfer</>)}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Crypto Transfer */}
            <TabsContent value="crypto">
              <Card>
                <CardHeader>
                  <CardTitle>Crypto Transfer</CardTitle>
                  <CardDescription>Send cryptocurrency to an external wallet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Your Crypto Balances</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {cryptoBalances?.map((balance) => (
                        <Card key={balance.currency} className={`cursor-pointer transition-all ${selectedCrypto === balance.currency ? 'border-primary bg-primary/10' : 'hover:border-primary/50'}`} onClick={() => setSelectedCrypto(balance.currency)}>
                          <CardContent className="p-3 text-center">
                            <p className="text-lg font-bold">{balance.currency}</p>
                            <p className="text-sm text-muted-foreground">{(balance.amount || 0).toFixed(balance.currency === 'USDT' ? 2 : 6)}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Recipient Wallet Address</Label>
                    <Input id="walletAddress" type="text" placeholder="Enter wallet address" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="font-mono text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cryptoAmount">Amount</Label>
                    <div className="flex gap-2">
                      <Input id="cryptoAmount" type="number" placeholder="0.00" value={cryptoAmount} onChange={(e) => setCryptoAmount(e.target.value)} className="flex-1" />
                      <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                        <SelectTrigger className="w-28"><SelectValue placeholder="Crypto" /></SelectTrigger>
                        <SelectContent>
                          {cryptoBalances?.map((balance) => (
                            <SelectItem key={balance.currency} value={balance.currency}>{balance.currency}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cryptoDescription">Note (optional)</Label>
                    <Textarea id="cryptoDescription" placeholder="Add a note for this transfer" value={cryptoDescription} onChange={(e) => setCryptoDescription(e.target.value)} rows={2} />
                  </div>
                  <Card className="bg-amber-500/10 border-amber-500/20">
                    <CardContent className="pt-4 flex gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-700 dark:text-amber-400">
                        <p className="font-medium">Important</p>
                        <p>Double-check the wallet address. Crypto transfers are irreversible.</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Button onClick={handleCryptoTransfer} className="w-full" disabled={isTransferring || !selectedCrypto}>
                    {isTransferring ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>) : (<><Send className="mr-2 h-4 w-4" />Send {selectedCrypto || 'Crypto'}</>)}
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

export default Transfer;
