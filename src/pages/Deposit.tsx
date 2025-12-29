import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Bitcoin, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedCrypto, setSelectedCrypto] = useState<keyof typeof cryptoWallets>("BTC");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("");

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
    setTimeout(() => setCopiedAddress(null), 3000);
  };

  const handleTraditionalDeposit = () => {
    if (!depositAmount || !depositMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Deposit Initiated",
      description: `Your ${depositMethod} deposit of $${depositAmount} is being processed.`,
    });
    setDepositAmount("");
    setDepositMethod("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Deposit Funds</h1>
          <p className="text-muted-foreground mb-8">Add money to your account via bank transfer or cryptocurrency</p>

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
                  <CardTitle>Bank Transfer Deposit</CardTitle>
                  <CardDescription>Transfer funds from your external bank account</CardDescription>
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
                      </CardContent>
                    </Card>
                  )}

                  <Button onClick={handleTraditionalDeposit} className="w-full">
                    Initiate Deposit
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crypto">
              <Card>
                <CardHeader>
                  <CardTitle>Crypto Deposit</CardTitle>
                  <CardDescription>Send cryptocurrency to your wallet address</CardDescription>
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

                  <Card className="bg-amber-500/10 border-amber-500/20">
                    <CardContent className="pt-4">
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        <strong>Important:</strong> Only send {cryptoWallets[selectedCrypto].name} ({selectedCrypto}) to this address. 
                        Sending any other cryptocurrency may result in permanent loss of funds.
                      </p>
                    </CardContent>
                  </Card>
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
