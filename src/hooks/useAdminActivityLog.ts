import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type ActivityAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'status_change' 
  | 'bulk_delete' 
  | 'bulk_status_change'
  | 'role_change';

export type EntityType = 'loan' | 'user' | 'transaction' | 'crypto_balance';

export interface ActivityLog {
  id: string;
  admin_id: string;
  action: ActivityAction;
  entity_type: EntityType;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  admin_email?: string;
  admin_name?: string;
}

export function useAdminActivityLogs() {
  return useQuery({
    queryKey: ['admin-activity-logs'],
    queryFn: async () => {
      const { data: logs, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get unique admin IDs
      const adminIds = [...new Set(logs.map((l) => l.admin_id))];

      // Fetch profiles for those admins
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', adminIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return logs.map((log) => {
        const profile = profileMap.get(log.admin_id);
        return {
          ...log,
          admin_email: profile?.email,
          admin_name: profile?.full_name,
        };
      }) as ActivityLog[];
    },
  });
}

export function useLogAdminActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      entityType,
      entityId,
      details,
    }: {
      action: ActivityAction;
      entityType: EntityType;
      entityId?: string;
      details?: Json;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('admin_activity_logs').insert([{
        admin_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        details: details || null,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-activity-logs'] });
    },
  });
}
