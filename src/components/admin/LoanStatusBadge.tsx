import { Badge } from '@/components/ui/badge';
import type { Database } from '@/integrations/supabase/types';

type LoanStatus = Database['public']['Enums']['loan_status'];

interface LoanStatusBadgeProps {
  status: LoanStatus | null;
}

export function LoanStatusBadge({ status }: LoanStatusBadgeProps) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10">
          Pending
        </Badge>
      );
    case 'under_review':
      return (
        <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10">
          Under Review
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10">
          Rejected
        </Badge>
      );
    case 'active':
      return (
        <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
          Active
        </Badge>
      );
    case 'paid_off':
      return (
        <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 bg-muted/50">
          Paid Off
        </Badge>
      );
    default:
      return null;
  }
}
