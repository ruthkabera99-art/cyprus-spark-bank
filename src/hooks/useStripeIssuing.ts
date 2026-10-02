import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FunctionsHttpError } from '@supabase/supabase-js';
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

export interface CardUsageTransaction {
  id: string;
  amount: number;
  currency: string;
  created: number;
  type: string;
  merchant_name: string;
  merchant_city: string | null;
  merchant_country: string | null;
}

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('stripe-issuing', { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const response = await error.context.json().catch(() => null) as { error?: string } | null;
      throw new Error(response?.error ?? error.message);
    }
    throw error;
  }
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
    mutationFn: (payload: {
      request_id: string;
      admin_note?: string | null;
      billing: { city: string; state: string; postal_code: string; country: string };
    }) =>
      invoke<{
        success: boolean;
        existing: boolean;
        card_id: string;
        last4: string;
        brand: string;
        exp_month: number;
        exp_year: number;
      }>({
        action: 'issue',
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-requests'] });
    },
  });
}

/** Load settled Stripe Issuing transactions for one issued card. */
export function useStripeCardUsage(cardId: string | null) {
  return useQuery({
    queryKey: ['stripe-issuing', 'usage', cardId],
    queryFn: () => invoke<{ card_id: string; transactions: CardUsageTransaction[] }>({
      action: 'usage',
      card_id: cardId,
    }),
    enabled: Boolean(cardId?.startsWith('ic_')),
    staleTime: 30_000,
    retry: false,
  });
}

export interface CardBalance {
  request_id: string;
  card_id: string;
  cardholder_name: string;
  card_type: string;
  last_four: string | null;
  currency: string;
  status: string;
  spending_limit: number | null;
  spending_interval: string | null;
  spent: number;
  remaining: number | null;
  error: string | null;
}

export interface IssuingBalances {
  issuing_balance: { amount: number; currency: string }[];
  cards: CardBalance[];
}

/** Remaining spendable amount per issued Stripe card plus the funding balance. */
export function useIssuingBalances(enabled: boolean) {
  return useQuery({
    queryKey: ['stripe-issuing', 'balances'],
    queryFn: () => invoke<IssuingBalances>({ action: 'balances' }),
    enabled,
    staleTime: 30_000,
    retry: false,
  });
}

export interface CardCharge {
  id: string;
  card_id: string;
  cardholder_name: string;
  last_four: string | null;
  amount: number;
  currency: string;
  created: number;
  type: string;
  merchant_name: string;
  merchant_city: string | null;
}

/** Every real charge recorded on issued Stripe cards (latest 100). */
export function useIssuingCharges(enabled: boolean) {
  return useQuery({
    queryKey: ['stripe-issuing', 'charges'],
    queryFn: () => invoke<{ charges: CardCharge[] }>({ action: 'charges' }),
    enabled,
    staleTime: 30_000,
    retry: false,
  });
}

/** Set the spending limit that defines how much a card has left. */
export function useSetCardSpendingLimit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      card_id: string;
      amount: number;
      interval: 'per_authorization' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
    }) => invoke<{ success: boolean }>({ action: 'set_spending_limit', ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-issuing', 'balances'] });
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
