import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type CardRequestRow = Database['public']['Tables']['card_requests']['Row'];
export type CardRequestStatus = Database['public']['Enums']['card_request_status'];
export type CardTypeEnum = Database['public']['Enums']['card_type'];

export interface AdminCardRequest extends CardRequestRow {
  profile: {
    full_name: string | null;
    email: string;
    account_number: string | null;
  } | null;
}

/** Current user's own card requests */
export function useMyCardRequests() {
  return useQuery({
    queryKey: ['card-requests', 'me'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('card_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CardRequestRow[];
    },
  });
}

export interface NewCardRequest {
  card_type: CardTypeEnum;
  cardholder_name: string;
  delivery_address?: string | null;
  phone?: string | null;
}

export function useCreateCardRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewCardRequest) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in to request a card');
      const { data, error } = await supabase
        .from('card_requests')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-requests'] });
    },
  });
}

export function useCancelCardRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('card_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-requests'] });
    },
  });
}

/** All card requests, with the requesting customer's profile attached (admin only) */
export function useAdminCardRequests() {
  return useQuery({
    queryKey: ['card-requests', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('card_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((data ?? []).map((r) => r.user_id))];
      let profileMap = new Map<string, AdminCardRequest['profile']>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, account_number')
          .in('id', userIds);
        profiles?.forEach((p) =>
          profileMap.set(p.id, {
            full_name: p.full_name,
            email: p.email,
            account_number: p.account_number,
          }),
        );
      }

      return (data ?? []).map((r) => ({
        ...r,
        profile: profileMap.get(r.user_id) ?? null,
      })) as AdminCardRequest[];
    },
  });
}

export function useUpdateCardRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Database['public']['Tables']['card_requests']['Update'];
    }) => {
      const { data, error } = await supabase
        .from('card_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-requests'] });
    },
  });
}

export function useDeleteCardRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('card_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-requests'] });
    },
  });
}
