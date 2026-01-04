import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  History, 
  Edit, 
  Trash2, 
  Plus, 
  ArrowRightLeft,
  Shield,
  CheckCircle
} from 'lucide-react';
import { useAdminActivityLogs, type ActivityLog } from '@/hooks/useAdminActivityLog';
import { format, formatDistanceToNow } from 'date-fns';

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
          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export function ActivityLogTab() {
  const { data: logs, isLoading } = useAdminActivityLogs();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !logs?.length ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activity logs yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
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
