import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { LoanWithProfile } from '@/hooks/useAdminLoans';
import type { Database } from '@/integrations/supabase/types';

type LoanStatus = Database['public']['Enums']['loan_status'];
type CollateralType = Database['public']['Enums']['collateral_type'];

interface LoanFormDialogProps {
  loan?: LoanWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LoanFormData) => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export interface LoanFormData {
  user_id: string;
  amount: number;
  purpose: string;
  term_months: number;
  interest_rate: number;
  monthly_payment: number;
  collateral_type: CollateralType;
  collateral_value: number;
  collateral_description?: string;
  crypto_currency?: string;
  crypto_amount?: number;
  ltv_ratio?: number;
  status?: LoanStatus;
  amount_paid?: number;
  remaining_payments?: number;
}

const LOAN_PURPOSES = [
  'business_expansion',
  'equipment_purchase',
  'working_capital',
  'debt_consolidation',
  'personal',
  'real_estate',
  'other',
];

const COLLATERAL_TYPES: CollateralType[] = [
  'real_estate',
  'vehicle',
  'equipment',
  'crypto',
  'other',
];

const LOAN_STATUSES: LoanStatus[] = [
  'pending',
  'under_review',
  'approved',
  'rejected',
  'active',
  'paid_off',
];

export function LoanFormDialog({
  loan,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  mode,
}: LoanFormDialogProps) {
  const [formData, setFormData] = useState<Partial<LoanFormData>>({
    amount: 0,
    term_months: 12,
    interest_rate: 8.5,
    collateral_type: 'other',
    collateral_value: 0,
    status: 'pending',
  });

  useEffect(() => {
    if (loan && mode === 'edit') {
      setFormData({
        user_id: loan.user_id,
        amount: loan.amount,
        purpose: loan.purpose,
        term_months: loan.term_months,
        interest_rate: loan.interest_rate,
        monthly_payment: loan.monthly_payment,
        collateral_type: loan.collateral_type,
        collateral_value: loan.collateral_value,
        collateral_description: loan.collateral_description || undefined,
        crypto_currency: loan.crypto_currency || undefined,
        crypto_amount: loan.crypto_amount || undefined,
        ltv_ratio: loan.ltv_ratio || undefined,
        status: loan.status || 'pending',
        amount_paid: loan.amount_paid || 0,
        remaining_payments: loan.remaining_payments || undefined,
      });
    } else if (mode === 'create') {
      setFormData({
        amount: 0,
        term_months: 12,
        interest_rate: 8.5,
        collateral_type: 'other',
        collateral_value: 0,
        status: 'pending',
      });
    }
  }, [loan, mode, open]);

  // Calculate monthly payment
  useEffect(() => {
    if (formData.amount && formData.term_months && formData.interest_rate) {
      const monthlyRate = formData.interest_rate / 100 / 12;
      const numPayments = formData.term_months;
      const monthlyPayment =
        (formData.amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
      setFormData((prev) => ({
        ...prev,
        monthly_payment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
      }));
    }
  }, [formData.amount, formData.term_months, formData.interest_rate]);

  // Calculate LTV ratio
  useEffect(() => {
    if (formData.amount && formData.collateral_value && formData.collateral_value > 0) {
      const ltv = (formData.amount / formData.collateral_value) * 100;
      setFormData((prev) => ({ ...prev, ltv_ratio: ltv }));
    }
  }, [formData.amount, formData.collateral_value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as LoanFormData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Loan' : 'Edit Loan Application'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="user_id">User ID</Label>
              <Input
                id="user_id"
                value={formData.user_id || ''}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                placeholder="Enter user UUID"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Loan Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="100"
                value={formData.amount || ''}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select
                value={formData.purpose || ''}
                onValueChange={(value) => setFormData({ ...formData, purpose: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_PURPOSES.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="term_months">Term (months)</Label>
              <Select
                value={formData.term_months?.toString() || '12'}
                onValueChange={(value) =>
                  setFormData({ ...formData, term_months: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[6, 12, 24, 36, 48, 60, 72, 84, 120].map((months) => (
                    <SelectItem key={months} value={months.toString()}>
                      {months} months
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interest_rate">Interest Rate (%)</Label>
              <Input
                id="interest_rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.interest_rate || ''}
                onChange={(e) =>
                  setFormData({ ...formData, interest_rate: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Monthly Payment (calculated)</Label>
              <Input
                value={`$${(formData.monthly_payment || 0).toFixed(2)}`}
                disabled
                className="bg-muted"
              />
            </div>

            {mode === 'edit' && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || 'pending'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as LoanStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Collateral Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collateral_type">Collateral Type</Label>
                <Select
                  value={formData.collateral_type || 'other'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, collateral_type: value as CollateralType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLATERAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collateral_value">Collateral Value ($)</Label>
                <Input
                  id="collateral_value"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.collateral_value || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      collateral_value: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>LTV Ratio (calculated)</Label>
                <Input
                  value={`${(formData.ltv_ratio || 0).toFixed(2)}%`}
                  disabled
                  className="bg-muted"
                />
              </div>

              {formData.collateral_type === 'crypto' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="crypto_currency">Crypto Currency</Label>
                    <Select
                      value={formData.crypto_currency || ''}
                      onValueChange={(value) =>
                        setFormData({ ...formData, crypto_currency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select crypto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                        <SelectItem value="USDT">Tether (USDT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crypto_amount">Crypto Amount</Label>
                    <Input
                      id="crypto_amount"
                      type="number"
                      min="0"
                      step="0.0001"
                      value={formData.crypto_amount || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          crypto_amount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="collateral_description">Collateral Description</Label>
              <Textarea
                id="collateral_description"
                value={formData.collateral_description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, collateral_description: e.target.value })
                }
                placeholder="Additional details about the collateral..."
                rows={3}
              />
            </div>
          </div>

          {mode === 'edit' && (formData.status === 'active' || formData.status === 'paid_off') && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Payment Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount_paid">Amount Paid ($)</Label>
                  <Input
                    id="amount_paid"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount_paid || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount_paid: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remaining_payments">Remaining Payments</Label>
                  <Input
                    id="remaining_payments"
                    type="number"
                    min="0"
                    value={formData.remaining_payments || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        remaining_payments: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Loan' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
