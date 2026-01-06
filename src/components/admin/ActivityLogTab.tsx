import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Loader2, 
  History, 
  Edit, 
  Trash2, 
  Plus, 
  ArrowRightLeft,
  Shield,
  CheckCircle,
  Search,
  CalendarIcon,
  X,
  RefreshCw,
  Filter
} from 'lucide-react';
import { useAdminActivityLogs, type ActivityLog, type ActivityLogFilters, type ActivityAction, type EntityType } from '@/hooks/useAdminActivityLog';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const actionIcons: Record<string, React.ReactNode> = {
  create: <Plus className="h-4 w-4 text-green-500" />,
  update: <Edit className="h-4 w-4 text-blue-500" />,
  delete: <Trash2 className="h-4 w-4 text-red-500" />,
  status_change: <ArrowRightLeft className="h-4 w-4 text-amber-500" />,
  bulk_delete: <Trash2 className="h-4 w-4 text-red-500" />,
  bulk_status_change: <CheckCircle className="h-4 w-4 text-purple-500" />,
  role_change: <Shield className="h-4 w-4 text-amber-500" />,
};

const actionLabels: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  status_change: 'Status Changed',
  bulk_delete: 'Bulk Deleted',
  bulk_status_change: 'Bulk Status Changed',
  role_change: 'Role Changed',
};

const entityLabels: Record<string, string> = {
  loan: 'Loan',
  user: 'User',
  transaction: 'Transaction',
  crypto_balance: 'Crypto Balance',
};

const ENTITY_TYPE_OPTIONS: { value: EntityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'loan', label: 'Loan' },
  { value: 'user', label: 'User' },
  { value: 'transaction', label: 'Transaction' },
  { value: 'crypto_balance', label: 'Crypto Balance' },
];

const ACTION_OPTIONS: { value: ActivityAction | 'all'; label: string }[] = [
  { value: 'all', label: 'All Actions' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'status_change', label: 'Status Change' },
  { value: 'bulk_delete', label: 'Bulk Delete' },
  { value: 'bulk_status_change', label: 'Bulk Status Change' },
  { value: 'role_change', label: 'Role Change' },
];

function ActivityLogItem({ log }: { log: ActivityLog }) {
  const details = log.details as Record<string, unknown> | null;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="mt-0.5">{actionIcons[log.action] || <History className="h-4 w-4" />}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {actionLabels[log.action] || log.action}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {entityLabels[log.entity_type] || log.entity_type}
          </Badge>
        </div>
        <p className="text-sm mt-1">
          <span className="font-medium">{log.admin_name || log.admin_email || 'Admin'}</span>
          {' '}
          {actionLabels[log.action]?.toLowerCase() || log.action}
          {' '}
          {log.entity_id && (
            <span className="text-muted-foreground">
              {entityLabels[log.entity_type]?.toLowerCase()} {log.entity_id.slice(0, 8)}...
            </span>
          )}
        </p>
        {details && Object.keys(details).length > 0 && (
          <div className="mt-1 text-xs text-muted-foreground">
            {details.count && <span>Count: {String(details.count)} • </span>}
            {details.old_status && details.new_status && (
              <span>
                {String(details.old_status)} → {String(details.new_status)}
              </span>
            )}
            {details.new_role && <span>New role: {String(details.new_role)}</span>}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')} • {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export function ActivityLogTab() {
  const [filters, setFilters] = useState<ActivityLogFilters>({});
  const [searchInput, setSearchInput] = useState('');
  const { data: logs, isLoading, refetch } = useAdminActivityLogs(filters);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput || undefined }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchInput('');
  };

  const hasActiveFilters =
    filters.search ||
    (filters.entityType && filters.entityType !== 'all') ||
    (filters.action && filters.action !== 'all') ||
    filters.startDate ||
    filters.endDate;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters Section */}
        <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-lg border">
          {/* Search and Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by admin, action, or entity..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSearch}
                className="pl-9"
              />
            </div>

            {/* Entity Type Filter */}
            <Select
              value={filters.entityType || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, entityType: value as EntityType | 'all' }))
              }
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action Filter */}
            <Select
              value={filters.action || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, action: value as ActivityAction | 'all' }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Start Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[180px] justify-start text-left font-normal',
                    !filters.startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate
                    ? format(filters.startDate, 'MMM dd, yyyy')
                    : 'Start Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) =>
                    setFilters((prev) => ({ ...prev, startDate: date }))
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground text-sm">to</span>

            {/* End Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[180px] justify-start text-left font-normal',
                    !filters.endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate
                    ? format(filters.endDate, 'MMM dd, yyyy')
                    : 'End Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) =>
                    setFilters((prev) => ({ ...prev, endDate: date }))
                  }
                  disabled={(date) =>
                    filters.startDate ? date < filters.startDate : false
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading...'
              : `Showing ${logs?.length || 0} activities`}
          </div>
        </div>

        {/* Activity List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !logs?.length ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {hasActiveFilters ? 'No activities match your filters' : 'No activity logs yet'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-1">
              {logs.map((log) => (
                <ActivityLogItem key={log.id} log={log} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
