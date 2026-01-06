import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
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

export interface ActivityLogFilters {
  search?: string;
  entityType?: EntityType | 'all';
  action?: ActivityAction | 'all';
  startDate?: Date;
  endDate?: Date;
}

export function useAdminActivityLogs(filters?: ActivityLogFilters) {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-activity-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_activity_logs',
        },
        () => {
          // Invalidate query to refetch with new data
          queryClient.invalidateQueries({ queryKey: ['admin-activity-logs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-activity-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply entity type filter
      if (filters?.entityType && filters.entityType !== 'all') {
        query = query.eq('entity_type', filters.entityType);
      }

      // Apply action filter
      if (filters?.action && filters.action !== 'all') {
        query = query.eq('action', filters.action);
      }

      // Apply date range filters
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endOfDay.toISOString());
      }

      const { data: logs, error } = await query.limit(500);

      if (error) throw error;

      // Get unique admin IDs
      const adminIds = [...new Set(logs.map((l) => l.admin_id))];

      // Fetch profiles for those admins
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', adminIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      let result = logs.map((log) => {
        const profile = profileMap.get(log.admin_id);
        return {
          ...log,
          admin_email: profile?.email,
          admin_name: profile?.full_name,
        };
      }) as ActivityLog[];

      // Apply search filter (client-side for flexibility)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter((log) =>
          log.action.toLowerCase().includes(searchLower) ||
          log.entity_type.toLowerCase().includes(searchLower) ||
          log.admin_email?.toLowerCase().includes(searchLower) ||
          log.admin_name?.toLowerCase().includes(searchLower) ||
          log.entity_id?.toLowerCase().includes(searchLower)
        );
      }

      return result;
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
