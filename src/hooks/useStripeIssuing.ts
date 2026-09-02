import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface IssuingStatus {
  configured: boolean;
  reason?: string;
  livemode?: boolean;
  account_id?: string;
  country?: string;
  issuing_enabled?: boolean;
  issuing_error?: string | null;
}

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('stripe-issuing', { body });
  if (error) throw error;
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as T;
}

/** Whether a Stripe Issuing key is configured and usable. */
export function useIssuingStatus() {
  return useQuery({
    queryKey: ['stripe-issuing', 'status'],
    queryFn: () => invoke<IssuingStatus>({ action: 'status' }),
    staleTime: 60_000,
    retry: false,
  });
}

/** Issue a real Stripe Issuing card against a card request. */
export function useIssueStripeCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { request_id: string; admin_note?: string | null }) =>
      invoke<{ success: boolean; last4: string; brand: string; pan_available: boolean }>({
        action: 'issue',
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-requests'] });
    },
  });
}

/** Freeze, unfreeze or cancel an issued Stripe card. */
export function useSetStripeCardStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { card_id: string; status: 'active' | 'inactive' | 'canceled' }) =>
      invoke<{ success: boolean; status: string }>({ action: 'set_card_status', ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-requests'] });
    },
  });
}
