import { Bell, ArrowLeft, Wallet, RefreshCw, FileText, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

interface PreferenceItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  isUpdating: boolean;
}

function PreferenceItem({ icon, title, description, enabled, onToggle, isUpdating }: PreferenceItemProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={isUpdating}
      />
    </div>
  );
}

function PreferenceSkeleton() {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-6 w-11 rounded-full" />
    </div>
  );
}

export default function NotificationPreferences() {
  const { preferences, isLoading, updatePreferences, isUpdating } = useNotificationPreferences();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notification Preferences</h1>
            <p className="text-muted-foreground">Control which notifications you receive</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Real-time Notifications</CardTitle>
            <CardDescription>
              Choose which types of real-time notifications appear in your notification center
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <>
                <PreferenceSkeleton />
                <Separator />
                <PreferenceSkeleton />
                <Separator />
                <PreferenceSkeleton />
              </>
            ) : (
              <>
                <PreferenceItem
                  icon={<Wallet className="h-5 w-5" />}
                  title="Transaction Notifications"
                  description="Get notified about deposits, withdrawals, and transfers"
                  enabled={preferences.transactions_enabled}
                  onToggle={(enabled) => updatePreferences({ transactions_enabled: enabled })}
                  isUpdating={isUpdating}
                />
                <Separator />
                <PreferenceItem
                  icon={<RefreshCw className="h-5 w-5" />}
                  title="Balance Change Notifications"
                  description="Get notified when your crypto portfolio balance changes"
                  enabled={preferences.balance_changes_enabled}
                  onToggle={(enabled) => updatePreferences({ balance_changes_enabled: enabled })}
                  isUpdating={isUpdating}
                />
                <Separator />
                <PreferenceItem
                  icon={<FileText className="h-5 w-5" />}
                  title="Loan Update Notifications"
                  description="Get notified about loan application status changes"
                  enabled={preferences.loan_updates_enabled}
                  onToggle={(enabled) => updatePreferences({ loan_updates_enabled: enabled })}
                  isUpdating={isUpdating}
                />
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Changes are saved automatically
        </p>
      </div>
    </div>
  );
}
