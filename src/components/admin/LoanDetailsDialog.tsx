import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoanStatusBadge } from './LoanStatusBadge';
import { format } from 'date-fns';
import type { LoanWithProfile } from '@/hooks/useAdminLoans';

interface LoanDetailsDialogProps {
  loan: LoanWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoanDetailsDialog({ loan, open, onOpenChange }: LoanDetailsDialogProps) {
  if (!loan) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Loan Application Details
            <LoanStatusBadge status={loan.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Applicant Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Applicant Information
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{loan.profiles?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{loan.profiles?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{loan.profiles?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-medium">
                  {loan.submitted_at ? format(new Date(loan.submitted_at), 'PPp') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Loan Details
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium text-lg">{formatCurrency(loan.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purpose</p>
                <p className="font-medium capitalize">{loan.purpose.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Term</p>
                <p className="font-medium">{loan.term_months} months</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="font-medium">{loan.interest_rate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                <p className="font-medium">{formatCurrency(loan.monthly_payment)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Repayment</p>
                <p className="font-medium">
                  {formatCurrency(loan.monthly_payment * loan.term_months)}
                </p>
              </div>
            </div>
          </div>

          {/* Collateral */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Collateral Information
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{loan.collateral_type.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Value</p>
                <p className="font-medium">{formatCurrency(loan.collateral_value)}</p>
              </div>
              {loan.ltv_ratio && (
                <div>
                  <p className="text-sm text-muted-foreground">LTV Ratio</p>
                  <p className="font-medium">{loan.ltv_ratio.toFixed(2)}%</p>
                </div>
              )}
              {loan.crypto_currency && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Crypto Currency</p>
                    <p className="font-medium">{loan.crypto_currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Crypto Amount</p>
                    <p className="font-medium">{loan.crypto_amount}</p>
                  </div>
                </>
              )}
              {loan.collateral_description && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{loan.collateral_description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Status (for active loans) */}
          {(loan.status === 'active' || loan.status === 'paid_off') && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Payment Status
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="font-medium">{formatCurrency(loan.amount_paid || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining Payments</p>
                  <p className="font-medium">{loan.remaining_payments || 0}</p>
                </div>
                {loan.next_payment_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Next Payment Date</p>
                    <p className="font-medium">
                      {format(new Date(loan.next_payment_date), 'PP')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Timeline
            </h3>
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-medium text-sm">
                  {loan.submitted_at ? format(new Date(loan.submitted_at), 'PP') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reviewed</p>
                <p className="font-medium text-sm">
                  {loan.reviewed_at ? format(new Date(loan.reviewed_at), 'PP') : 'Pending'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="font-medium text-sm">
                  {loan.approved_at ? format(new Date(loan.approved_at), 'PP') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
