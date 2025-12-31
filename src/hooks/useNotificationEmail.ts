import { supabase } from '@/integrations/supabase/client';

interface TransactionNotification {
  type: 'transaction_created' | 'transaction_status_changed';
  userId: string;
  data: {
    transactionId?: string;
    transactionType?: string;
    amount?: number;
    currency?: string;
    status?: string;
    oldStatus?: string;
  };
}

interface RoleNotification {
  type: 'role_changed';
  userId: string;
  data: {
    newRole: string;
  };
}

type NotificationPayload = TransactionNotification | RoleNotification;

export async function sendNotificationEmail(payload: NotificationPayload) {
  try {
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      body: payload,
    });

    if (error) {
      console.error('Failed to send notification email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending notification email:', error);
    return { success: false, error };
  }
}
