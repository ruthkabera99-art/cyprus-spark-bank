import { corsHeaders, createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const STRIPE_API = 'https://api.stripe.com/v1';

const RequestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('status') }),
  z.object({
    action: z.literal('issue'),
    request_id: z.string().uuid(),
    admin_note: z.string().trim().max(1000).nullable().optional(),
    billing: z.object({
      city: z.string().trim().min(2).max(100),
      state: z.string().trim().min(2).max(100),
      postal_code: z.string().trim().min(3).max(20),
      country: z.string().trim().length(2).transform((value) => value.toUpperCase()),
    }),
  }),
  z.object({
    action: z.literal('set_card_status'),
    card_id: z.string().startsWith('ic_'),
    status: z.enum(['active', 'inactive', 'canceled']),
  }),
  z.object({
    action: z.literal('usage'),
    card_id: z.string().startsWith('ic_'),
  }),
  z.object({ action: z.literal('balances') }),
  z.object({ action: z.literal('charges') }),
  z.object({
    action: z.literal('set_spending_limit'),
    card_id: z.string().startsWith('ic_'),
    amount: z.number().int().min(0).max(100_000_000),
    interval: z.enum(['per_authorization', 'daily', 'weekly', 'monthly', 'yearly', 'all_time']),
  }),
]);

class StripeError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function form(params: Record<string, string | undefined>) {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') result.append(key, value);
  }
  return result;
}

async function stripe(
  path: string,
  key: string,
  init?: { method?: string; body?: URLSearchParams; idempotencyKey?: string },
) {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(init?.idempotencyKey ? { 'Idempotency-Key': init.idempotencyKey } : {}),
    },
    body: init?.body,
  });
  const text = await response.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    data = {};
  }
  if (!response.ok) {
    const stripeError = data.error as { message?: string } | undefined;
    console.error(`Stripe request failed [${response.status}]: ${text}`);
    throw new StripeError(stripeError?.message ?? `Stripe request failed (${response.status})`, response.status);
  }
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return json({ error: 'Server configuration is incomplete' }, 500);

  try {
    const parsed = RequestSchema.safeParse(await req.json().catch(() => ({ action: 'status' })));
    if (!parsed.success) return json({ error: 'Invalid request', fields: parsed.error.flatten().fieldErrors }, 400);

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) return json({ error: 'Unauthorized' }, 401);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401);

    const { data: isAdmin, error: roleError } = await admin.rpc('has_role', {
      _user_id: userData.user.id,
      _role: 'admin',
    });
    if (roleError || !isAdmin) return json({ error: 'Admin access required' }, 403);

    const body = parsed.data;
    if (body.action === 'status') {
      if (!stripeKey) return json({ configured: false, reason: 'Stripe is not connected' });
      try {
        const account = await stripe('/account', stripeKey);
        const issuing = await stripe('/issuing/cards?limit=1', stripeKey).catch((error) => {
          if (error instanceof StripeError) return { issuingError: error.message };
          return { issuingError: 'Stripe Issuing is unavailable' };
        });
        const issuingError = typeof issuing.issuingError === 'string' ? issuing.issuingError : null;
        return json({
          configured: true,
          livemode: !stripeKey.startsWith('sk_test_'),
          account_id: account.id,
          country: account.country,
          issuing_enabled: !issuingError,
          issuing_error: issuingError,
        });
      } catch (error) {
        return json({ configured: false, reason: error instanceof Error ? error.message : 'Stripe key is invalid' });
      }
    }

    if (!stripeKey) return json({ error: 'Stripe is not connected. Use the Demo card option instead.' }, 400);

    if (body.action === 'usage') {
      const card = await stripe(`/issuing/cards/${body.card_id}`, stripeKey);
      const requestId = (card.metadata as Record<string, string> | undefined)?.card_request_id;
      if (!requestId) return json({ error: 'This Stripe card is not linked to a card request' }, 400);

      const { data: ownedRequest } = await admin
        .from('card_requests')
        .select('id')
        .eq('id', requestId)
        .eq('issued_reference', body.card_id)
        .maybeSingle();
      if (!ownedRequest) return json({ error: 'Card request link could not be verified' }, 403);

      const transactions = await stripe(
        `/issuing/transactions?card=${encodeURIComponent(body.card_id)}&limit=100`,
        stripeKey,
      );
      const rows = Array.isArray(transactions.data) ? transactions.data : [];
      return json({
        card_id: body.card_id,
        transactions: rows.map((item) => {
          const transaction = item as Record<string, unknown>;
          const merchant = transaction.merchant_data as Record<string, unknown> | undefined;
          return {
            id: String(transaction.id ?? ''),
            amount: Number(transaction.amount ?? 0),
            currency: String(transaction.currency ?? 'usd'),
            created: Number(transaction.created ?? 0),
            type: String(transaction.type ?? 'capture'),
            merchant_name: String(merchant?.name ?? 'Card purchase'),
            merchant_city: merchant?.city ? String(merchant.city) : null,
            merchant_country: merchant?.country ? String(merchant.country) : null,
          };
        }),
      });
    }

    if (body.action === 'charges') {
      const { data: issued } = await admin
        .from('card_requests')
        .select('cardholder_name, issued_reference, issued_last_four')
        .like('issued_reference', 'ic_%');
      const byCard = new Map((issued ?? []).map((r) => [String(r.issued_reference), r]));
      const list = await stripe('/issuing/transactions?limit=100', stripeKey);
      const rows = Array.isArray(list.data) ? list.data : [];
      return json({
        charges: rows.map((item) => {
          const t = item as Record<string, unknown>;
          const m = t.merchant_data as Record<string, unknown> | undefined;
          const cardId = typeof t.card === 'string' ? t.card : String((t.card as { id?: string })?.id ?? '');
          const linked = byCard.get(cardId);
          return {
            id: String(t.id ?? ''),
            card_id: cardId,
            cardholder_name: linked?.cardholder_name ?? 'Unlinked card',
            last_four: linked?.issued_last_four ?? null,
            amount: Number(t.amount ?? 0),
            currency: String(t.currency ?? 'usd'),
            created: Number(t.created ?? 0),
            type: String(t.type ?? 'capture'),
            merchant_name: String(m?.name ?? 'Card purchase'),
            merchant_city: m?.city ? String(m.city) : null,
          };
        }),
      });
    }

    if (body.action === 'balances') {
      const balance = await stripe('/balance', stripeKey);
      const issuingBalance = (balance.issuing as { available?: Array<Record<string, unknown>> } | undefined)?.available ?? [];

      const { data: issuedRequests } = await admin
        .from('card_requests')
        .select('id, cardholder_name, card_type, issued_reference, issued_last_four, issued_at')
        .not('issued_reference', 'is', null)
        .eq('status', 'issued')
        .order('issued_at', { ascending: false })
        .limit(50);

      const liveRequests = (issuedRequests ?? []).filter((request) =>
        typeof request.issued_reference === 'string' && request.issued_reference.startsWith('ic_'),
      );

      const cards = await Promise.all(liveRequests.map(async (request) => {
        const cardId = String(request.issued_reference);
        try {
          const card = await stripe(`/issuing/cards/${cardId}`, stripeKey);
          const controls = card.spending_controls as { spending_limits?: Array<Record<string, unknown>> } | undefined;
          const limitEntry = controls?.spending_limits?.[0];
          const limit = limitEntry ? Number(limitEntry.amount ?? 0) : null;
          const interval = limitEntry ? String(limitEntry.interval ?? 'all_time') : null;

          const transactions = await stripe(
            `/issuing/transactions?card=${encodeURIComponent(cardId)}&limit=100`,
            stripeKey,
          );
          const rows = Array.isArray(transactions.data) ? transactions.data : [];
          const spent = rows.reduce((total, item) => {
            const amount = Number((item as Record<string, unknown>).amount ?? 0);
            return amount < 0 ? total + Math.abs(amount) : total - amount;
          }, 0);

          return {
            request_id: request.id,
            card_id: cardId,
            cardholder_name: request.cardholder_name,
            card_type: request.card_type,
            last_four: request.issued_last_four,
            currency: String(card.currency ?? 'usd'),
            status: String(card.status ?? 'unknown'),
            spending_limit: limit,
            spending_interval: interval,
            spent: Math.max(spent, 0),
            remaining: limit === null ? null : Math.max(limit - Math.max(spent, 0), 0),
            error: null as string | null,
          };
        } catch (error) {
          return {
            request_id: request.id,
            card_id: cardId,
            cardholder_name: request.cardholder_name,
            card_type: request.card_type,
            last_four: request.issued_last_four,
            currency: 'usd',
            status: 'unknown',
            spending_limit: null,
            spending_interval: null,
            spent: 0,
            remaining: null,
            error: error instanceof Error ? error.message : 'Could not load this card',
          };
        }
      }));

      return json({
        issuing_balance: issuingBalance.map((entry) => ({
          amount: Number(entry.amount ?? 0),
          currency: String(entry.currency ?? 'usd'),
        })),
        cards,
      });
    }

    if (body.action === 'set_spending_limit') {
      const updated = await stripe(`/issuing/cards/${body.card_id}`, stripeKey, {
        method: 'POST',
        body: form({
          'spending_controls[spending_limits][0][amount]': String(body.amount),
          'spending_controls[spending_limits][0][interval]': body.interval,
        }),
      });
      return json({ success: true, card_id: String(updated.id) });
    }

    if (body.action === 'issue') {
      const { data: cardRequest, error: requestError } = await admin
        .from('card_requests')
        .select('*')
        .eq('id', body.request_id)
        .maybeSingle();
      if (requestError || !cardRequest) return json({ error: 'Card request not found' }, 404);
      if (cardRequest.card_type === 'btc') {
        return json({ error: 'Stripe Issuing cannot issue a BTC-network card. Use the Demo card option.' }, 400);
      }

      if (cardRequest.issued_reference?.startsWith('ic_')) {
        const existing = await stripe(`/issuing/cards/${cardRequest.issued_reference}`, stripeKey);
        return json({
          success: true,
          existing: true,
          card_id: existing.id,
          last4: existing.last4,
          brand: existing.brand,
          exp_month: existing.exp_month,
          exp_year: existing.exp_year,
        });
      }

      const { data: profile, error: profileError } = await admin
        .from('profiles')
        .select('email, phone, address, full_name')
        .eq('id', cardRequest.user_id)
        .maybeSingle();
      if (profileError || !profile?.email) return json({ error: 'Customer email is required before live issuance' }, 400);

      const line1 = cardRequest.delivery_address?.trim() || profile.address?.trim();
      if (!line1) return json({ error: 'Customer delivery address is required before live issuance' }, 400);

      const cardholder = await stripe('/issuing/cardholders', stripeKey, {
        method: 'POST',
        idempotencyKey: `cardholder-${body.request_id}`,
        body: form({
          name: cardRequest.cardholder_name,
          email: profile.email,
          phone_number: cardRequest.phone ?? profile.phone ?? undefined,
          status: 'active',
          type: 'individual',
          'billing[address][line1]': line1,
          'billing[address][city]': body.billing.city,
          'billing[address][state]': body.billing.state,
          'billing[address][postal_code]': body.billing.postal_code,
          'billing[address][country]': body.billing.country,
          'metadata[card_request_id]': body.request_id,
        }),
      });

      const card = await stripe('/issuing/cards', stripeKey, {
        method: 'POST',
        idempotencyKey: `card-${body.request_id}`,
        body: form({
          cardholder: String(cardholder.id),
          currency: 'usd',
          type: 'virtual',
          status: 'active',
          'metadata[card_request_id]': body.request_id,
          'metadata[requested_design]': cardRequest.card_type,
        }),
      });

      const last4 = String(card.last4 ?? '');
      const { error: updateError } = await admin
        .from('card_requests')
        .update({
          status: 'issued',
          issued_at: new Date().toISOString(),
          card_number: null,
          cvv: null,
          issued_cvv: null,
          expiry_month: Number(card.exp_month),
          expiry_year: Number(card.exp_year),
          issued_reference: String(card.id),
          issued_last_four: last4,
          issued_display_number: `•••• •••• •••• ${last4}`,
          admin_note: body.admin_note || cardRequest.admin_note,
        })
        .eq('id', body.request_id);
      if (updateError) throw updateError;

      return json({
        success: true,
        existing: false,
        card_id: card.id,
        last4,
        brand: card.brand,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
      });
    }

    const card = await stripe(`/issuing/cards/${body.card_id}`, stripeKey, {
      method: 'POST',
      body: form({ status: body.status }),
    });
    return json({ success: true, status: card.status });
  } catch (error) {
    console.error('stripe-issuing error', error);
    const status = error instanceof StripeError ? error.status : 500;
    return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, status);
  }
});