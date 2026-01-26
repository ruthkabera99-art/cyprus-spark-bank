import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Loader2, CreditCard, ArrowUpRight, ArrowDownLeft, Trash2, CheckCircle, XCircle, Clock, Plus, Edit, DollarSign } from 'lucide-react';
import { useAdminTransactions, useUpdateTransactionStatus, useDeleteTransaction, useCreateAdminTransaction, useUpdateTransaction, useApproveDeposit, type TransactionWithUser } from '@/hooks/useAdminTransactions';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { sendNotificationEmail } from '@/hooks/useNotificationEmail';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { TablePagination } from './TablePagination';
import { BulkActionsBar } from './BulkActionsBar';
import { usePagination } from '@/hooks/usePagination';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useLogAdminActivity } from '@/hooks/useAdminActivityLog';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function TransactionsManagement() {
  const { data: transactions, isLoading } = useAdminTransactions();
  const { data: users } = useAdminUsers();
  const updateStatus = useUpdateTransactionStatus();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();
  const createTx = useCreateAdminTransaction();
  const approveDeposit = useApproveDeposit();
  const logActivity = useLogAdminActivity();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  
  // Create transaction dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTx, setNewTx] = useState({
    user_id: '',
    type: 'deposit',
    category: 'traditional',
    currency: 'USD',
    amount: '',
    status: 'completed',
    description: '',
  });

  // Edit transaction dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTx, setEditTx] = useState<TransactionWithUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    type: '',
    category: '',
    currency: '',
    amount: '',
    status: '',
    description: '',
  });

  const filteredTransactions = transactions?.filter((tx) => {
    const matchesSearch =
      tx.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedData: paginatedTransactions,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({ data: filteredTransactions, initialPageSize: 10 });

  const {
    selectedCount,
    selectedItems,
    isAllSelected,
    isPartiallySelected,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
  } = useBulkSelection(paginatedTransactions);

  const handleStatusChange = async (id: string, status: string) => {
    const tx = transactions?.find((t) => t.id === id);
    try {
      await updateStatus.mutateAsync({ id, status });
      
      logActivity.mutate({
        action: 'status_change',
        entityType: 'transaction',
        entityId: id,
        details: { old_status: tx?.status, new_status: status },
      });
      
      // Send email notification for status change
      if (tx) {
        sendNotificationEmail({
          type: 'transaction_status_changed',
          userId: tx.user_id,
          data: {
            transactionId: tx.id,
            transactionType: tx.type,
            amount: tx.amount,
            currency: tx.currency,
            oldStatus: tx.status,
            status,
          },
        });
      }
      
      toast.success(`Transaction status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update transaction status');
    }
  };

  const handleApproveDeposit = async (tx: TransactionWithUser) => {
    if (tx.type !== 'deposit' || tx.status !== 'pending') {
      toast.error('Can only approve pending deposit requests');
      return;
    }

    try {
      await approveDeposit.mutateAsync({
        transactionId: tx.id,
        userId: tx.user_id,
        amount: tx.amount,
        category: tx.category,
        currency: tx.currency,
      });

      logActivity.mutate({
        action: 'status_change',
        entityType: 'transaction',
        entityId: tx.id,
        details: { 
          action: 'approve_deposit',
          amount: tx.amount, 
          currency: tx.currency,
          category: tx.category
        },
      });

      // Send email notification
      sendNotificationEmail({
        type: 'transaction_status_changed',
        userId: tx.user_id,
        data: {
          transactionId: tx.id,
          transactionType: 'deposit',
          amount: tx.amount,
          currency: tx.currency,
          oldStatus: 'pending',
          status: 'completed',
        },
      });

      toast.success('Deposit approved and balance updated successfully');
    } catch (error) {
      toast.error('Failed to approve deposit');
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        selectedItems.map((tx) => updateStatus.mutateAsync({ id: tx.id, status }))
      );
      logActivity.mutate({
        action: 'bulk_status_change',
        entityType: 'transaction',
        details: { new_status: status, count: selectedCount },
      });
      toast.success(`Updated ${selectedCount} transactions to ${status}`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to update some transactions');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkUpdating(true);
    try {
      await Promise.all(selectedItems.map((tx) => deleteTx.mutateAsync(tx.id)));
      logActivity.mutate({
        action: 'bulk_delete',
        entityType: 'transaction',
        details: { count: selectedCount },
      });
      toast.success(`Deleted ${selectedCount} transactions`);
      clearSelection();
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete some transactions');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleDelete = (id: string) => {
    setTxToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!txToDelete) return;
    try {
      await deleteTx.mutateAsync(txToDelete);
      logActivity.mutate({
        action: 'delete',
        entityType: 'transaction',
        entityId: txToDelete,
      });
      toast.success('Transaction deleted');
      setDeleteDialogOpen(false);
      setTxToDelete(null);
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleCreateTransaction = async () => {
    if (!newTx.user_id || !newTx.amount) {
      toast.error('Please select a user and enter an amount');
      return;
    }

    try {
      const created = await createTx.mutateAsync({
        user_id: newTx.user_id,
        type: newTx.type,
        category: newTx.category,
        currency: newTx.currency,
        amount: parseFloat(newTx.amount),
        status: newTx.status,
        description: newTx.description || `Admin ${newTx.type}`,
      });
      
      // Send email notification for new transaction
      sendNotificationEmail({
        type: 'transaction_created',
        userId: newTx.user_id,
        data: {
          transactionType: newTx.type,
          amount: parseFloat(newTx.amount),
          currency: newTx.currency,
          status: newTx.status,
        },
      });
      
      toast.success('Transaction created successfully');
      setCreateDialogOpen(false);
      setNewTx({
        user_id: '',
        type: 'deposit',
        category: 'traditional',
        currency: 'USD',
        amount: '',
        status: 'completed',
        description: '',
      });
    } catch (error) {
      toast.error('Failed to create transaction');
    }
  };

  const handleEdit = (tx: TransactionWithUser) => {
    setEditTx(tx);
    setEditFormData({
      type: tx.type,
      category: tx.category,
      currency: tx.currency,
      amount: String(tx.amount),
      status: tx.status,
      description: tx.description || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editTx) return;

    try {
      await updateTx.mutateAsync({
        id: editTx.id,
        updates: {
          type: editFormData.type,
          category: editFormData.category,
          currency: editFormData.currency,
          amount: parseFloat(editFormData.amount) || 0,
          status: editFormData.status,
          description: editFormData.description,
        },
      });
      toast.success('Transaction updated successfully');
      setEditDialogOpen(false);
      setEditTx(null);
    } catch (error) {
      toast.error('Failed to update transaction');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      cancelled: 'outline',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    if (type === 'deposit' || type === 'loan_disbursement') {
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
    }
    return <ArrowUpRight className="h-4 w-4 text-red-500" />;
  };

  const formatAmount = (tx: TransactionWithUser) => {
    const prefix = tx.amount < 0 ? '' : '+';
    if (tx.category === 'crypto') {
      return `${prefix}${tx.amount} ${tx.currency}`;
    }
    return `${prefix}$${Math.abs(tx.amount).toLocaleString()}`;
  };

  const stats = {
    total: transactions?.length || 0,
    completed: transactions?.filter((t) => t.status === 'completed').length || 0,
    pending: transactions?.filter((t) => t.status === 'pending').length || 0,
    volume: transactions
      ?.filter((t) => t.category === 'traditional' && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">USD Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">${stats.volume.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, description, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="loan_disbursement">Loan</SelectItem>
                <SelectItem value="loan_payment">Payment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Transaction
            </Button>
          </div>
        </CardContent>
      </Card>

      <BulkActionsBar
        selectedCount={selectedCount}
        onClear={clearSelection}
        onBulkDelete={() => setBulkDeleteDialogOpen(true)}
        onBulkStatusChange={handleBulkStatusChange}
        isDeleting={isBulkUpdating}
        isUpdating={isBulkUpdating}
        entityType="transactions"
      />

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !filteredTransactions?.length ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                        className={isPartiallySelected ? 'opacity-50' : ''}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((tx) => (
                    <TableRow key={tx.id} className={isSelected(tx.id) ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected(tx.id)}
                          onCheckedChange={() => toggleItem(tx.id)}
                          aria-label={`Select transaction ${tx.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tx.user_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{tx.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(tx.type)}
                          <span className="capitalize">{tx.type.replace(/_/g, ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`font-medium ${tx.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {formatAmount(tx)}
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {tx.description || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.created_at ? format(new Date(tx.created_at), 'MMM d, HH:mm') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border border-border">
                            {/* Show Approve Deposit option for pending deposits */}
                            {tx.type === 'deposit' && tx.status === 'pending' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleApproveDeposit(tx)}
                                  className="text-green-600 focus:text-green-600 font-medium"
                                >
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Approve Deposit & Update Balance
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleEdit(tx)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Transaction
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(tx.id, 'completed')}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Mark Completed (No Balance Update)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(tx.id, 'pending')}>
                              <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                              Mark Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(tx.id, 'failed')}>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              Mark Failed
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(tx.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isLoading={deleteTx.isPending}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
      />

      {/* Bulk Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={handleBulkDelete}
        isLoading={isBulkUpdating}
        title="Delete Multiple Transactions"
        description={`Are you sure you want to delete ${selectedCount} selected transactions? This action cannot be undone.`}
      />

      {/* Create Transaction Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={newTx.user_id} onValueChange={(v) => setNewTx({ ...newTx, user_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newTx.type} onValueChange={(v) => setNewTx({ ...newTx, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="loan_disbursement">Loan Disbursement</SelectItem>
                    <SelectItem value="loan_payment">Loan Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={newTx.category} 
                  onValueChange={(v) => setNewTx({ 
                    ...newTx, 
                    category: v, 
                    currency: v === 'traditional' ? 'USD' : 'BTC' 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traditional">Traditional (USD)</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                {newTx.category === 'traditional' ? (
                  <Input value="USD" disabled />
                ) : (
                  <Select value={newTx.currency} onValueChange={(v) => setNewTx({ ...newTx, currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newTx.status} onValueChange={(v) => setNewTx({ ...newTx, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                placeholder="Transaction description..."
                value={newTx.description}
                onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTransaction} disabled={createTx.isPending}>
              {createTx.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={editFormData.type} onValueChange={(v) => setEditFormData({ ...editFormData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="loan_disbursement">Loan Disbursement</SelectItem>
                    <SelectItem value="loan_payment">Loan Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={editFormData.category} 
                  onValueChange={(v) => setEditFormData({ 
                    ...editFormData, 
                    category: v, 
                    currency: v === 'traditional' ? 'USD' : editFormData.currency 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traditional">Traditional (USD)</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                {editFormData.category === 'traditional' ? (
                  <Input value="USD" disabled />
                ) : (
                  <Select value={editFormData.currency} onValueChange={(v) => setEditFormData({ ...editFormData, currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editFormData.status} onValueChange={(v) => setEditFormData({ ...editFormData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Transaction description..."
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateTx.isPending}>
              {updateTx.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
