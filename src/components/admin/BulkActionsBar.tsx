import { Button } from '@/components/ui/button';
import { X, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  onBulkDelete?: () => void;
  onBulkStatusChange?: (status: string) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
  entityType: 'loans' | 'users' | 'transactions';
}

export function BulkActionsBar({
  selectedCount,
  onClear,
  onBulkDelete,
  onBulkStatusChange,
  isDeleting,
  isUpdating,
  entityType,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-primary/10 border border-primary/20 rounded-lg mb-4">
      <div className="flex items-center gap-3">
        <span className="font-medium text-sm">
          {selectedCount} {entityType} selected
        </span>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {entityType === 'loans' && onBulkStatusChange && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkStatusChange('approved')}
              disabled={isUpdating}
            >
              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
              Approve All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkStatusChange('under_review')}
              disabled={isUpdating}
            >
              <Clock className="h-4 w-4 mr-1 text-blue-500" />
              Mark Review
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkStatusChange('rejected')}
              disabled={isUpdating}
            >
              <XCircle className="h-4 w-4 mr-1 text-red-500" />
              Reject All
            </Button>
          </>
        )}

        {entityType === 'transactions' && onBulkStatusChange && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkStatusChange('completed')}
              disabled={isUpdating}
            >
              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
              Complete All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkStatusChange('pending')}
              disabled={isUpdating}
            >
              <Clock className="h-4 w-4 mr-1 text-yellow-500" />
              Mark Pending
            </Button>
          </>
        )}

        {onBulkDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete All
          </Button>
        )}
      </div>
    </div>
  );
}
