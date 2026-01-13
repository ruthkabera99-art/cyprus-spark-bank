import { format } from 'date-fns';
import { Receipt, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLoanPayments, type LoanPayment } from '@/hooks/useLoanPayments';

interface PaymentHistorySectionProps {
  loanId: string;
  loanPurpose: string;
}

export function PaymentHistorySection({ loanId, loanPurpose }: PaymentHistorySectionProps) {
  const { data: payments, isLoading } = useLoanPayments(loanId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No payments made yet</p>
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <span className="font-medium">Total Paid</span>
        </div>
        <span className="text-lg font-bold text-success">${totalPaid.toLocaleString()}</span>
      </div>

      {/* Payment List */}
      <div className="space-y-2">
        {payments.map((payment) => (
          <PaymentItem key={payment.id} payment={payment} />
        ))}
      </div>
    </div>
  );
}

function PaymentItem({ payment }: { payment: LoanPayment }) {
  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'bg-success text-success-foreground', label: 'Completed' },
    pending: { icon: Clock, color: 'bg-warning text-warning-foreground', label: 'Pending' },
    failed: { icon: Clock, color: 'bg-destructive text-destructive-foreground', label: 'Failed' },
  };

  const status = statusConfig[payment.status as keyof typeof statusConfig] || statusConfig.completed;
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <DollarSign className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-medium">${Number(payment.amount).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(payment.payment_date), 'MMM d, yyyy • h:mm a')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {payment.payment_method}
        </Badge>
        <Badge className={status.color}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {status.label}
        </Badge>
      </div>
    </div>
  );
}
