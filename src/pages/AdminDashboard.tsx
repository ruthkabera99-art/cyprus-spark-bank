import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { AdminTabs } from '@/components/admin/AdminTabs';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { TransactionsManagement } from '@/components/admin/TransactionsManagement';
import { CryptoManagement } from '@/components/admin/CryptoManagement';
import { ActivityLogTab } from '@/components/admin/ActivityLogTab';
import { SeoVerification } from '@/components/admin/SeoVerification';
import { LoanPaymentsManagement } from '@/components/admin/LoanPaymentsManagement';
import { ChatManagement } from '@/components/admin/ChatManagement';
import { LoanStatusBadge } from '@/components/admin/LoanStatusBadge';
import { LoanActionsDropdown } from '@/components/admin/LoanActionsDropdown';
import { LoanDetailsDialog } from '@/components/admin/LoanDetailsDialog';
import { LoanFormDialog, type LoanFormData } from '@/components/admin/LoanFormDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { TablePagination } from '@/components/admin/TablePagination';
import { BulkActionsBar } from '@/components/admin/BulkActionsBar';
import { usePagination } from '@/hooks/usePagination';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useLogAdminActivity } from '@/hooks/useAdminActivityLog';
import { useAdminChats } from '@/hooks/useChat';
import {
  useAdminLoans,
  useUpdateLoanStatus,
  useCreateAdminLoan,
  useUpdateAdminLoan,
  useDeleteLoan,
  type LoanWithProfile,
} from '@/hooks/useAdminLoans';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  Loader2,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';


type LoanStatus = Database['public']['Enums']['loan_status'];

export default function AdminDashboard() {
  const { data: loans, isLoading, refetch } = useAdminLoans();
  const updateStatus = useUpdateLoanStatus();
  const createLoan = useCreateAdminLoan();
  const updateLoan = useUpdateAdminLoan();
  const deleteLoan = useDeleteLoan();
  const logActivity = useLogAdminActivity();
  const { unreadCount: unreadChatCount } = useAdminChats();

  const [activeTab, setActiveTab] = useState('loans');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLoan, setSelectedLoan] = useState<LoanWithProfile | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [loanToDelete, setLoanToDelete] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const filteredLoans = loans?.filter((loan) => {
    const matchesSearch =
      loan.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedData: paginatedLoans,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({ data: filteredLoans, initialPageSize: 10 });

  const {
    selectedCount,
    selectedItems,
    isAllSelected,
    isPartiallySelected,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
  } = useBulkSelection(paginatedLoans);

  const stats = {
    total: loans?.length || 0,
    pending: loans?.filter((l) => l.status === 'pending').length || 0,
    underReview: loans?.filter((l) => l.status === 'under_review').length || 0,
    approved: loans?.filter((l) => l.status === 'approved').length || 0,
    active: loans?.filter((l) => l.status === 'active').length || 0,
    totalAmount: loans?.reduce((sum, l) => sum + l.amount, 0) || 0,
  };

  const handleStatusChange = async (id: string, status: LoanStatus) => {
    const loan = loans?.find((l) => l.id === id);
    try {
      await updateStatus.mutateAsync({ id, status });
      logActivity.mutate({
        action: 'status_change',
        entityType: 'loan',
        entityId: id,
        details: { old_status: loan?.status, new_status: status },
      });
      toast.success(`Loan status updated to ${status.replace(/_/g, ' ')}`);
    } catch (error) {
      toast.error('Failed to update loan status');
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        selectedItems.map((loan) =>
          updateStatus.mutateAsync({ id: loan.id, status: status as LoanStatus })
        )
      );
      logActivity.mutate({
        action: 'bulk_status_change',
        entityType: 'loan',
        details: { new_status: status, count: selectedCount },
      });
      toast.success(`Updated ${selectedCount} loans to ${status.replace(/_/g, ' ')}`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to update some loans');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkUpdating(true);
    try {
      await Promise.all(selectedItems.map((loan) => deleteLoan.mutateAsync(loan.id)));
      logActivity.mutate({
        action: 'bulk_delete',
        entityType: 'loan',
        details: { count: selectedCount },
      });
      toast.success(`Deleted ${selectedCount} loans`);
      clearSelection();
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete some loans');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleView = (id: string) => {
    const loan = loans?.find((l) => l.id === id);
    if (loan) {
      setSelectedLoan(loan);
      setViewDialogOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    const loan = loans?.find((l) => l.id === id);
    if (loan) {
      setSelectedLoan(loan);
      setFormMode('edit');
      setFormDialogOpen(true);
    }
  };

  const handleCreate = () => {
    setSelectedLoan(null);
    setFormMode('create');
    setFormDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setLoanToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!loanToDelete) return;
    try {
      await deleteLoan.mutateAsync(loanToDelete);
      logActivity.mutate({
        action: 'delete',
        entityType: 'loan',
        entityId: loanToDelete,
      });
      toast.success('Loan application deleted');
      setDeleteDialogOpen(false);
      setLoanToDelete(null);
    } catch (error) {
      toast.error('Failed to delete loan');
    }
  };

  const handleFormSubmit = async (data: LoanFormData) => {
    try {
      if (formMode === 'create') {
        const created = await createLoan.mutateAsync(data);
        logActivity.mutate({
          action: 'create',
          entityType: 'loan',
          entityId: created.id,
        });
        toast.success('Loan application created');
      } else if (selectedLoan) {
        await updateLoan.mutateAsync({ id: selectedLoan.id, ...data });
        logActivity.mutate({
          action: 'update',
          entityType: 'loan',
          entityId: selectedLoan.id,
        });
        toast.success('Loan application updated');
      }
      setFormDialogOpen(false);
    } catch (error) {
      toast.error(`Failed to ${formMode === 'create' ? 'create' : 'update'} loan`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your banking system</p>
          </div>
        </div>

        <div className="mb-6">
          <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} unreadChatCount={unreadChatCount} />
        </div>

        {activeTab === 'loans' && (
          <>
            <div className="flex justify-end mb-4 gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Loan
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{stats.total}</span>
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
                  <CardTitle className="text-sm font-medium text-muted-foreground">Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">{stats.underReview}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold">{stats.approved}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-emerald-500" />
                    <span className="text-2xl font-bold">{stats.active}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paid_off">Paid Off</SelectItem>
                    </SelectContent>
                  </Select>
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
              entityType="loans"
            />

            <Card>
              <CardHeader>
                <CardTitle>Loan Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !filteredLoans?.length ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No loan applications found</p>
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
                            <TableHead>Applicant</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Purpose</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedLoans.map((loan) => (
                            <TableRow key={loan.id} className={isSelected(loan.id) ? 'bg-primary/5' : ''}>
                              <TableCell>
                                <Checkbox
                                  checked={isSelected(loan.id)}
                                  onCheckedChange={() => toggleItem(loan.id)}
                                  aria-label={`Select loan ${loan.id}`}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{loan.profiles?.full_name || 'Unknown'}</p>
                                  <p className="text-sm text-muted-foreground">{loan.profiles?.email}</p>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{formatCurrency(loan.amount)}</TableCell>
                              <TableCell className="capitalize">{loan.purpose.replace(/_/g, ' ')}</TableCell>
                              <TableCell><LoanStatusBadge status={loan.status} /></TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {loan.submitted_at ? format(new Date(loan.submitted_at), 'MMM d, yyyy') : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                <LoanActionsDropdown
                                  loanId={loan.id}
                                  currentStatus={loan.status}
                                  onStatusChange={handleStatusChange}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                  onView={handleView}
                                />
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
          </>
        )}

        {activeTab === 'payments' && <LoanPaymentsManagement />}
        {activeTab === 'users' && <UsersManagement />}
        {activeTab === 'transactions' && <TransactionsManagement />}
        {activeTab === 'crypto' && <CryptoManagement />}
        {activeTab === 'chat' && <ChatManagement />}
        {activeTab === 'activity' && <ActivityLogTab />}
        {activeTab === 'seo' && <SeoVerification />}
      </main>
      <Footer />

      <LoanDetailsDialog loan={selectedLoan} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
      <LoanFormDialog
        loan={selectedLoan}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={handleFormSubmit}
        isLoading={createLoan.isPending || updateLoan.isPending}
        mode={formMode}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isLoading={deleteLoan.isPending}
      />
      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={handleBulkDelete}
        isLoading={isBulkUpdating}
        title="Delete Multiple Loans"
        description={`Are you sure you want to delete ${selectedCount} selected loans? This action cannot be undone.`}
      />
    </div>
  );
}
