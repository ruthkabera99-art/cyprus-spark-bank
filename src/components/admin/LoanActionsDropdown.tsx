import { MoreHorizontal, CheckCircle, XCircle, Eye, Edit, Trash2, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type LoanStatus = Database['public']['Enums']['loan_status'];

interface LoanActionsDropdownProps {
  loanId: string;
  currentStatus: LoanStatus | null;
  onStatusChange: (id: string, status: LoanStatus) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function LoanActionsDropdown({
  loanId,
  currentStatus,
  onStatusChange,
  onEdit,
  onDelete,
  onView,
}: LoanActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onView(loanId)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(loanId)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {currentStatus === 'pending' && (
          <DropdownMenuItem onClick={() => onStatusChange(loanId, 'under_review')}>
            <Clock className="mr-2 h-4 w-4 text-blue-500" />
            Mark Under Review
          </DropdownMenuItem>
        )}
        {(currentStatus === 'pending' || currentStatus === 'under_review') && (
          <>
            <DropdownMenuItem onClick={() => onStatusChange(loanId, 'approved')}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(loanId, 'rejected')}>
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              Reject
            </DropdownMenuItem>
          </>
        )}
        {currentStatus === 'approved' && (
          <DropdownMenuItem onClick={() => onStatusChange(loanId, 'active')}>
            <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
            Activate Loan
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onDelete(loanId)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
