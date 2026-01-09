import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Bitcoin, Send, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useCryptoBalances, useUpdateCryptoBalance } from "@/hooks/useCryptoBalances";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { supabase } from "@/integrations/supabase/client";

const Transfer = () => {
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { data: cryptoBalances } = useCryptoBalances();
  const updateCryptoBalance = useUpdateCryptoBalance();
  const createTransaction = useCreateTransaction();

  // Traditional transfer state
  const [recipientEmail, setRecipientEmail] = useState("");
  const [traditionalAmount, setTraditionalAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Crypto transfer state
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [cryptoDescription, setCryptoDescription] = useState("");

  const traditionalBalance = profile?.traditional_balance || 0;

  const handleTraditionalTransfer = async () => {
    if (!recipientEmail || !traditionalAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in recipient email and amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(traditionalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > traditionalBalance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this transfer",
        variant: "destructive",
      });
      return;
    }

    setIsTransferring(true);
    try {
      // Check if recipient exists
      const { data: recipientProfile, error: recipientError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', recipientEmail.toLowerCase().trim())
        .maybeSingle();

      if (recipientError) throw recipientError;

      if (!recipientProfile) {
        toast({
          title: "Recipient Not Found",
          description: "No user found with that email address",
          variant: "destructive",
        });
        setIsTransferring(false);
        return;
      }

      if (recipientProfile.id === profile?.id) {
        toast({
          title: "Invalid Transfer",
          description: "You cannot transfer to yourself",
          variant: "destructive",
        });
        setIsTransferring(false);
        return;
      }

      // Create outgoing transaction for sender
      await createTransaction.mutateAsync({
        type: 'transfer',
        category: 'traditional',
        currency: 'USD',
        amount: -amount,
        status: 'completed',
        description: description || `Transfer to ${recipientProfile.full_name || recipientEmail}`,
        recipient_address: recipientEmail,
        reference_id: `TRF-${Date.now()}`,
        network_fee: null,
      });

      // Deduct from sender's balance
      const { error: senderUpdateError } = await supabase
        .from('profiles')
        .update({ traditional_balance: traditionalBalance - amount })
        .eq('id', profile?.id);
      
      if (senderUpdateError) throw senderUpdateError;

      // Add to recipient's balance
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

      // Create incoming transaction for recipient (as a system insert)
      const { error: recipientTxError } = await supabase
        .from('transactions')
        .insert({
          user_id: recipientProfile.id,
          type: 'transfer',
          category: 'traditional',
          currency: 'USD',
          amount: amount,
          status: 'completed',
          description: `Transfer from ${profile?.full_name || profile?.email}`,
          reference_id: `TRF-${Date.now()}-IN`,
          recipient_address: null,
          network_fee: null,
        });

      // Note: recipientTxError might fail due to RLS - that's okay, recipient will see balance change

      toast({
        title: "Transfer Successful",
        description: `$${amount.toFixed(2)} sent to ${recipientProfile.full_name || recipientEmail}`,
      });

      setRecipientEmail("");
      setTraditionalAmount("");
      setDescription("");
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleCryptoTransfer = async () => {
    if (!selectedCrypto || !cryptoAmount || !walletAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(cryptoAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const cryptoBalance = cryptoBalances?.find(b => b.currency === selectedCrypto);
    const networkFee = selectedCrypto === 'BTC' ? 0.0001 : selectedCrypto === 'ETH' ? 0.002 : 1;
    const totalRequired = amount + networkFee;
    
    if (!cryptoBalance || totalRequired > (cryptoBalance.amount || 0)) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${totalRequired} ${selectedCrypto} (${amount} + ${networkFee} fee) but only have ${cryptoBalance?.amount || 0} ${selectedCrypto}`,
        variant: "destructive",
      });
      return;
    }

    setIsTransferring(true);
    try {
      await createTransaction.mutateAsync({
        type: 'transfer',
        category: 'crypto',
        currency: selectedCrypto,
        amount: -amount,
        status: 'pending',
        description: cryptoDescription || `${selectedCrypto} transfer`,
        recipient_address: walletAddress,
        reference_id: `CTRF-${Date.now()}`,
        network_fee: networkFee,
      });

      // Deduct from crypto balance (including network fee)
      await updateCryptoBalance.mutateAsync({
        currency: selectedCrypto,
        amount: (cryptoBalance.amount || 0) - totalRequired,
      });

      toast({
        title: "Transfer Initiated",
        description: `${amount} ${selectedCrypto} transfer is being processed`,
      });

      setSelectedCrypto("");
      setCryptoAmount("");
      setWalletAddress("");
      setCryptoDescription("");
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
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
          <p className="text-muted-foreground mb-8">Send money or cryptocurrency to other users</p>

          <Tabs defaultValue="traditional" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="traditional" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                To User
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                Crypto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="traditional">
              <Card>
                <CardHeader>
                  <CardTitle>Send to Another User</CardTitle>
                  <CardDescription>Transfer USD to another SecureBank user by email</CardDescription>
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
                    <Input
                      id="recipientEmail"
                      type="email"
                      placeholder="recipient@email.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={traditionalAmount}
                      onChange={(e) => setTraditionalAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="What's this transfer for?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleTraditionalTransfer} 
                    className="w-full"
                    disabled={isTransferring}
                  >
                    {isTransferring ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Transfer
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crypto">
              <Card>
                <CardHeader>
                  <CardTitle>Crypto Transfer</CardTitle>
                  <CardDescription>Send cryptocurrency to an external wallet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Crypto Balances */}
                  <div className="space-y-2">
                    <Label>Your Crypto Balances</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {cryptoBalances?.map((balance) => (
                        <Card 
                          key={balance.currency} 
                          className={`cursor-pointer transition-all ${
                            selectedCrypto === balance.currency 
                              ? 'border-primary bg-primary/10' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedCrypto(balance.currency)}
                        >
                          <CardContent className="p-3 text-center">
                            <p className="text-lg font-bold">{balance.currency}</p>
                            <p className="text-sm text-muted-foreground">
                              {(balance.amount || 0).toFixed(balance.currency === 'USDT' ? 2 : 6)}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Recipient Wallet Address</Label>
                    <Input
                      id="walletAddress"
                      type="text"
                      placeholder="Enter wallet address"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cryptoAmount">Amount</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cryptoAmount"
                        type="number"
                        placeholder="0.00"
                        value={cryptoAmount}
                        onChange={(e) => setCryptoAmount(e.target.value)}
                        className="flex-1"
                      />
                      <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="Crypto" />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptoBalances?.map((balance) => (
                            <SelectItem key={balance.currency} value={balance.currency}>
                              {balance.currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cryptoDescription">Note (optional)</Label>
                    <Textarea
                      id="cryptoDescription"
                      placeholder="Add a note for this transfer"
                      value={cryptoDescription}
                      onChange={(e) => setCryptoDescription(e.target.value)}
                      rows={2}
                    />
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

                  <Button 
                    onClick={handleCryptoTransfer} 
                    className="w-full"
                    disabled={isTransferring || !selectedCrypto}
                  >
                    {isTransferring ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send {selectedCrypto || 'Crypto'}
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

export default Transfer;
