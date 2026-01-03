import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Loader2, Wallet, Bitcoin, PlusCircle } from 'lucide-react';
import { useAdminUsers, useUpdateCryptoBalance } from '@/hooks/useAdminUsers';
import { useCreateAdminTransaction } from '@/hooks/useAdminTransactions';
import { TablePagination } from './TablePagination';
import { usePagination } from '@/hooks/usePagination';
import { toast } from 'sonner';

const CRYPTO_PRICES = {
  BTC: 43250,
  ETH: 2280,
  USDT: 1,
};

export function CryptoManagement() {
  const { data: users, isLoading } = useAdminUsers();
  const updateCryptoBalance = useUpdateCryptoBalance();
  const createTransaction = useCreateAdminTransaction();

  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addFundsDialogOpen, setAddFundsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('BTC');
  const [amount, setAmount] = useState('');

  const filteredUsers = users?.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedData: paginatedUsers,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({ data: filteredUsers, initialPageSize: 10 });

  const handleUpdateBalance = async () => {
    if (!selectedUserId || !selectedCurrency || !amount) return;

    try {
      await updateCryptoBalance.mutateAsync({
        userId: selectedUserId,
        currency: selectedCurrency,
        amount: parseFloat(amount) || 0,
      });
      toast.success('Crypto balance updated');
      setEditDialogOpen(false);
      setAmount('');
    } catch (error) {
      toast.error('Failed to update balance');
    }
  };

  const handleAddFunds = async () => {
    if (!selectedUserId || !selectedCurrency || !amount) return;

    try {
      const user = users?.find((u) => u.id === selectedUserId);
      const currentBalance = user?.crypto_balances.find((c) => c.currency === selectedCurrency);
      const newAmount = (currentBalance?.amount || 0) + parseFloat(amount);

      await updateCryptoBalance.mutateAsync({
        userId: selectedUserId,
        currency: selectedCurrency,
        amount: newAmount,
      });

      await createTransaction.mutateAsync({
        user_id: selectedUserId,
        type: 'deposit',
        category: 'crypto',
        currency: selectedCurrency,
        amount: parseFloat(amount),
        status: 'completed',
        description: `Admin deposit: ${amount} ${selectedCurrency}`,
      });

      toast.success(`Added ${amount} ${selectedCurrency} to user account`);
      setAddFundsDialogOpen(false);
      setAmount('');
    } catch (error) {
      toast.error('Failed to add funds');
    }
  };

  const openEditDialog = (userId: string, currency: string, currentAmount: number) => {
    setSelectedUserId(userId);
    setSelectedCurrency(currency);
    setAmount(String(currentAmount || 0));
    setEditDialogOpen(true);
  };

  const openAddFundsDialog = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedCurrency('BTC');
    setAmount('');
    setAddFundsDialogOpen(true);
  };

  // Calculate totals
  const totals = {
    BTC: users?.reduce((sum, u) => sum + (u.crypto_balances.find((c) => c.currency === 'BTC')?.amount || 0), 0) || 0,
    ETH: users?.reduce((sum, u) => sum + (u.crypto_balances.find((c) => c.currency === 'ETH')?.amount || 0), 0) || 0,
    USDT: users?.reduce((sum, u) => sum + (u.crypto_balances.find((c) => c.currency === 'USDT')?.amount || 0), 0) || 0,
  };

  const totalValue =
    totals.BTC * CRYPTO_PRICES.BTC +
    totals.ETH * CRYPTO_PRICES.ETH +
    totals.USDT * CRYPTO_PRICES.USDT;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total BTC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bitcoin className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">{totals.BTC.toFixed(4)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ≈ ${(totals.BTC * CRYPTO_PRICES.BTC).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total ETH</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-500">Ξ</span>
              <span className="text-2xl font-bold">{totals.ETH.toFixed(4)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ≈ ${(totals.ETH * CRYPTO_PRICES.ETH).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total USDT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-500">₮</span>
              <span className="text-2xl font-bold">{totals.USDT.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">≈ ${totals.USDT.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">${totalValue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Crypto Balances Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Crypto Balances</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !filteredUsers?.length ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>BTC</TableHead>
                      <TableHead>ETH</TableHead>
                      <TableHead>USDT</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => {
                      const btc = user.crypto_balances.find((c) => c.currency === 'BTC')?.amount || 0;
                      const eth = user.crypto_balances.find((c) => c.currency === 'ETH')?.amount || 0;
                      const usdt = user.crypto_balances.find((c) => c.currency === 'USDT')?.amount || 0;
                      const totalValue = btc * CRYPTO_PRICES.BTC + eth * CRYPTO_PRICES.ETH + usdt;

                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.full_name || 'No name'}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1"
                              onClick={() => openEditDialog(user.id, 'BTC', btc)}
                            >
                              <Badge variant="outline" className="text-orange-500">
                                {btc.toFixed(6)} BTC
                              </Badge>
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1"
                              onClick={() => openEditDialog(user.id, 'ETH', eth)}
                            >
                              <Badge variant="outline" className="text-blue-500">
                                {eth.toFixed(6)} ETH
                              </Badge>
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1"
                              onClick={() => openEditDialog(user.id, 'USDT', usdt)}
                            >
                              <Badge variant="outline" className="text-green-500">
                                {usdt.toFixed(2)} USDT
                              </Badge>
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">${totalValue.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAddFundsDialog(user.id)}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add Funds
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Balance Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {selectedCurrency} Balance</DialogTitle>
            <DialogDescription>Set the exact balance for this user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Balance ({selectedCurrency})</Label>
              <Input
                type="number"
                step={selectedCurrency === 'USDT' ? '0.01' : '0.00000001'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateBalance} disabled={updateCryptoBalance.isPending}>
                {updateCryptoBalance.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Funds Dialog */}
      <Dialog open={addFundsDialogOpen} onOpenChange={setAddFundsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Crypto Funds</DialogTitle>
            <DialogDescription>Add cryptocurrency to user's account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount to Add</Label>
              <Input
                type="number"
                step={selectedCurrency === 'USDT' ? '0.01' : '0.00000001'}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddFundsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFunds} disabled={createTransaction.isPending}>
                {createTransaction.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Funds'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
