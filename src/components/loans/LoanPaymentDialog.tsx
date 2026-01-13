import { useState } from 'react';
import { DollarSign, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateLoanPayment } from '@/hooks/useLoanPayments';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import type { LoanApplication } from '@/hooks/useLoanApplications';

interface LoanPaymentDialogProps {
  loan: LoanApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoanPaymentDialog({ loan, open, onOpenChange }: LoanPaymentDialogProps) {
  const { data: profile } = useProfile();
  const createPayment = useCreateLoanPayment();
  
  const remainingBalance = Number(loan.amount) - Number(loan.amount_paid || 0);
  const monthlyPayment = Number(loan.monthly_payment);
  const userBalance = Number(profile?.traditional_balance || 0);
  
  const [amount, setAmount] = useState(Math.min(monthlyPayment, remainingBalance).toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentAmount = parseFloat(amount) || 0;
  const hasInsufficientFunds = paymentAmount > userBalance;
  const exceedsRemaining = paymentAmount > remainingBalance;
  const isValidAmount = paymentAmount > 0 && !hasInsufficientFunds && !exceedsRemaining;

  const handleSubmit = async () => {
    if (!isValidAmount) return;
    
    setIsSubmitting(true);
    try {
      await createPayment.mutateAsync({
        loan_id: loan.id,
        amount: paymentAmount,
        payment_method: 'traditional',
      });
      
      toast.success('Payment successful!', {
        description: `$${paymentAmount.toLocaleString()} has been applied to your loan.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed', {
        description: 'There was an error processing your payment. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const setMonthlyAmount = () => setAmount(Math.min(monthlyPayment, remainingBalance).toString());
  const setFullPayoff = () => setAmount(Math.min(remainingBalance, userBalance).toString());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Make a Payment
          </DialogTitle>
          <DialogDescription>
            Pay towards your loan for "{loan.purpose}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Loan Summary */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-xs text-muted-foreground">Remaining Balance</p>
              <p className="font-bold text-lg">${remainingBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Payment</p>
              <p className="font-semibold">${monthlyPayment.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Your Balance</p>
              <p className="font-semibold text-primary">${userBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payments Left</p>
              <p className="font-semibold">{loan.remaining_payments ?? loan.term_months}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                max={remainingBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                placeholder="Enter amount"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setMonthlyAmount}
                className="text-xs"
              >
                Monthly (${monthlyPayment.toFixed(2)})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setFullPayoff}
                className="text-xs"
              >
                Pay Off (${Math.min(remainingBalance, userBalance).toLocaleString()})
              </Button>
            </div>
          </div>

          {/* Warnings */}
          {hasInsufficientFunds && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Insufficient funds. Your balance is ${userBalance.toLocaleString()}.
              </AlertDescription>
            </Alert>
          )}

          {exceedsRemaining && !hasInsufficientFunds && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Amount exceeds remaining balance of ${remainingBalance.toLocaleString()}.
              </AlertDescription>
            </Alert>
          )}

          {isValidAmount && paymentAmount >= remainingBalance && (
            <Alert className="border-success bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                This payment will fully pay off your loan!
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValidAmount || isSubmitting}
            className="gradient-primary"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay ${paymentAmount.toLocaleString()}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
