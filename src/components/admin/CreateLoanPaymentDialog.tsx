import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminLoans, type LoanWithProfile } from '@/hooks/useAdminLoans';
import {
  useCreateAdminLoanPayment,
  type CreateAdminLoanPaymentData,
} from '@/hooks/useAdminLoanPayments';
import { useLogAdminActivity } from '@/hooks/useAdminActivityLog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateLoanPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLoanPaymentDialog({
  open,
  onOpenChange,
}: CreateLoanPaymentDialogProps) {
  const { data: loans, isLoading: loansLoading } = useAdminLoans();
  const createPayment = useCreateAdminLoanPayment();
  const logActivity = useLogAdminActivity();

  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('traditional');
  const [status, setStatus] = useState<string>('completed');

  // Filter only active loans that have remaining payments
  const activeLoans = loans?.filter(
    (loan) => loan.status === 'active' || loan.status === 'approved'
  );

  const selectedLoan = activeLoans?.find((l) => l.id === selectedLoanId);

  useEffect(() => {
    if (!open) {
      setSelectedLoanId('');
      setAmount('');
      setPaymentMethod('traditional');
      setStatus('completed');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLoan) {
      toast.error('Please select a loan');
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const paymentData: CreateAdminLoanPaymentData = {
        loan_id: selectedLoan.id,
        user_id: selectedLoan.user_id,
        amount: paymentAmount,
        payment_method: paymentMethod,
        status: status,
      };

      const result = await createPayment.mutateAsync(paymentData);

      logActivity.mutate({
        action: 'create',
        entityType: 'transaction',
        entityId: result.id,
        details: {
          type: 'loan_payment',
          loan_id: selectedLoan.id,
          amount: paymentAmount,
          user_email: selectedLoan.profiles?.email,
        },
      });

      toast.success('Loan payment created successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to create payment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Loan Payment</DialogTitle>
          <DialogDescription>
            Record a loan payment on behalf of a user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loan">Select Loan</Label>
            <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an active loan" />
              </SelectTrigger>
              <SelectContent>
                {loansLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : activeLoans?.length === 0 ? (
                  <div className="py-4 px-2 text-sm text-muted-foreground text-center">
                    No active loans found
                  </div>
                ) : (
                  activeLoans?.map((loan) => (
                    <SelectItem key={loan.id} value={loan.id}>
                      <div className="flex flex-col">
                        <span>
                          {loan.profiles?.full_name || loan.profiles?.email || 'Unknown'} -{' '}
                          {formatCurrency(loan.amount)}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {loan.purpose.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedLoan && (
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User:</span>
                <span className="font-medium">
                  {selectedLoan.profiles?.full_name || selectedLoan.profiles?.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Amount:</span>
                <span className="font-medium">{formatCurrency(selectedLoan.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Payment:</span>
                <span className="font-medium">{formatCurrency(selectedLoan.monthly_payment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-medium">
                  {formatCurrency(selectedLoan.amount_paid || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="font-medium">
                  {formatCurrency(selectedLoan.amount - (selectedLoan.amount_paid || 0))}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder={selectedLoan ? `Suggested: ${selectedLoan.monthly_payment}` : 'Enter amount'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {selectedLoan && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => setAmount(String(selectedLoan.monthly_payment))}
              >
                Use Monthly Payment ({formatCurrency(selectedLoan.monthly_payment)})
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traditional">Traditional</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createPayment.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPayment.isPending || !selectedLoanId}>
              {createPayment.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
