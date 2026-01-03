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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Search, Edit, Loader2, Users, DollarSign, Shield, ShieldOff, MoreHorizontal, Trash2, Eye, RefreshCw } from 'lucide-react';
import { useAdminUsers, useUpdateUserBalance, useUpdateCryptoBalance, useUpdateUserProfile, useDeleteUser, type UserWithDetails } from '@/hooks/useAdminUsers';
import { useToggleAdminRole } from '@/hooks/useRoleManagement';
import { sendNotificationEmail } from '@/hooks/useNotificationEmail';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { TablePagination } from './TablePagination';
import { usePagination } from '@/hooks/usePagination';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function UsersManagement() {
  const { data: users, isLoading, refetch } = useAdminUsers();
  const updateBalance = useUpdateUserBalance();
  const updateCryptoBalance = useUpdateCryptoBalance();
  const updateProfile = useUpdateUserProfile();
  const toggleRole = useToggleAdminRole();
  const deleteUser = useDeleteUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    traditional_balance: '',
    btc_balance: '',
    eth_balance: '',
    usdt_balance: '',
  });

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

  const handleEdit = (user: UserWithDetails) => {
    setSelectedUser(user);
    const btc = user.crypto_balances.find((c) => c.currency === 'BTC');
    const eth = user.crypto_balances.find((c) => c.currency === 'ETH');
    const usdt = user.crypto_balances.find((c) => c.currency === 'USDT');

    setFormData({
      full_name: user.full_name || '',
      phone: user.phone || '',
      address: user.address || '',
      traditional_balance: String(user.traditional_balance || 0),
      btc_balance: String(btc?.amount || 0),
      eth_balance: String(eth?.amount || 0),
      usdt_balance: String(usdt?.amount || 0),
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      // Update profile info
      await updateProfile.mutateAsync({
        userId: selectedUser.id,
        updates: {
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
        },
      });

      // Update traditional balance
      await updateBalance.mutateAsync({
        userId: selectedUser.id,
        balance: parseFloat(formData.traditional_balance) || 0,
      });

      // Update crypto balances
      await updateCryptoBalance.mutateAsync({
        userId: selectedUser.id,
        currency: 'BTC',
        amount: parseFloat(formData.btc_balance) || 0,
      });

      await updateCryptoBalance.mutateAsync({
        userId: selectedUser.id,
        currency: 'ETH',
        amount: parseFloat(formData.eth_balance) || 0,
      });

      await updateCryptoBalance.mutateAsync({
        userId: selectedUser.id,
        currency: 'USDT',
        amount: parseFloat(formData.usdt_balance) || 0,
      });

      toast.success('User updated successfully');
      setEditDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleView = (user: UserWithDetails) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser.mutateAsync(userToDelete);
      toast.success('User and all related data deleted');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleRoleToggle = async (user: UserWithDetails) => {
    try {
      await toggleRole.mutateAsync({ userId: user.id, currentRole: user.role });
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      
      // Send email notification
      sendNotificationEmail({
        type: 'role_changed',
        userId: user.id,
        data: { newRole },
      });
      
      toast.success(`User ${user.role === 'admin' ? 'demoted to user' : 'promoted to admin'}`);
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const formatCurrency = (amount: number | null) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const stats = {
    totalUsers: users?.length || 0,
    admins: users?.filter((u) => u.role === 'admin').length || 0,
    totalBalance: users?.reduce((sum, u) => sum + (u.traditional_balance || 0), 0) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.totalUsers}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{stats.admins}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !filteredUsers?.length ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>USD Balance</TableHead>
                    <TableHead>Crypto</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.full_name || 'No name'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Switch
                              checked={user.role === 'admin'}
                              onCheckedChange={() => handleRoleToggle(user)}
                              disabled={toggleRole.isPending}
                            />
                            {user.role === 'admin' ? (
                              <Shield className="h-4 w-4 text-amber-500" />
                            ) : (
                              <ShieldOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(user.traditional_balance)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.crypto_balances.map((cb) => (
                            <Badge key={cb.currency} variant="outline" className="text-xs">
                              {cb.currency}: {(cb.amount || 0).toFixed(cb.currency === 'USDT' ? 2 : 4)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.created_at
                          ? format(new Date(user.created_at), 'MMM d, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border border-border">
                            <DropdownMenuItem onClick={() => handleView(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(user.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user profile and balances</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>USD Balance</Label>
              <Input
                type="number"
                value={formData.traditional_balance}
                onChange={(e) => setFormData({ ...formData, traditional_balance: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>BTC</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={formData.btc_balance}
                  onChange={(e) => setFormData({ ...formData, btc_balance: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>ETH</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={formData.eth_balance}
                  onChange={(e) => setFormData({ ...formData, eth_balance: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>USDT</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.usdt_balance}
                  onChange={(e) => setFormData({ ...formData, usdt_balance: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedUser.full_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedUser.address || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">USD Balance</p>
                  <p className="font-medium text-lg">{formatCurrency(selectedUser.traditional_balance)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {selectedUser.created_at
                      ? format(new Date(selectedUser.created_at), 'MMM d, yyyy')
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Crypto Balances</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.crypto_balances.map((cb) => (
                    <Badge key={cb.currency} variant="outline">
                      {cb.currency}: {(cb.amount || 0).toFixed(cb.currency === 'USDT' ? 2 : 6)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isLoading={deleteUser.isPending}
        title="Delete User"
        description="Are you sure you want to delete this user? This will permanently remove the user and all their data including transactions, loans, and balances. This action cannot be undone."
      />
    </div>
  );
}
