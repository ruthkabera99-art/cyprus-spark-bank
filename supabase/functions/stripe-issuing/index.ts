import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const STRIPE_API = 'https://api.stripe.com/v1';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function form(params: Record<string, string | undefined>) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') body.append(k, v);
  return body;
}

async function stripe(path: string, key: string, init?: { method?: string; body?: URLSearchParams }) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: init?.body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `Stripe request failed (${res.status})`);
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? 'status');

    // ---- Auth: caller must be a signed-in admin -------------------------------
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return json({ error: 'Unauthorized' }, 401);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: 'Unauthorized' }, 401);

    const { data: isAdmin } = await admin.rpc('has_role', {
      _user_id: userData.user.id,
      _role: 'admin',
    });
    if (!isAdmin) return json({ error: 'Admin access required' }, 403);

    // ---- status --------------------------------------------------------------
    if (action === 'status') {
      if (!stripeKey) {
        return json({ configured: false, reason: 'STRIPE_SECRET_KEY is not set' });
      }
      try {
        const account = await stripe('/account', stripeKey);
        const issuing = await stripe('/issuing/cards?limit=1', stripeKey).catch(() => null);
        return json({
          configured: true,
          livemode: !stripeKey.startsWith('sk_test'),
          account_id: account.id,
          country: account.country,
          issuing_enabled: !!issuing,
          issuing_error: issuing ? null : 'Issuing is not enabled on this Stripe account yet',
        });
      } catch (e) {
        return json({ configured: false, reason: e instanceof Error ? e.message : 'Invalid key' });
      }
    }

    if (!stripeKey) return json({ error: 'Stripe is not connected yet. Add STRIPE_SECRET_KEY.' }, 400);

    // ---- issue ---------------------------------------------------------------
    if (action === 'issue') {
      const requestId = String(body.request_id ?? '');
      if (!requestId) return json({ error: 'request_id is required' }, 400);

      const { data: cardRequest, error: reqErr } = await admin
        .from('card_requests')
        .select('*')
        .eq('id', requestId)
        .maybeSingle();
      if (reqErr || !cardRequest) return json({ error: 'Card request not found' }, 404);

      const { data: profile } = await admin
        .from('profiles')
        .select('email, phone, address, full_name')
        .eq('id', cardRequest.user_id)
        .maybeSingle();

      // 1. Cardholder
      const cardholder = await stripe('/issuing/cardholders', stripeKey, {
        method: 'POST',
        body: form({
          name: cardRequest.cardholder_name,
          email: profile?.email ?? undefined,
          phone_number: cardRequest.phone ?? profile?.phone ?? undefined,
          status: 'active',
          type: 'individual',
          'billing[address][line1]':
            cardRequest.delivery_address ?? profile?.address ?? 'Address on file',
          'billing[address][city]': String(body.city ?? 'New York'),
          'billing[address][state]': String(body.state ?? 'NY'),
          'billing[address][postal_code]': String(body.postal_code ?? '10001'),
          'billing[address][country]': String(body.country ?? 'US'),
        }),
      });

      // 2. Card
      const card = await stripe('/issuing/cards', stripeKey, {
        method: 'POST',
        body: form({
          cardholder: cardholder.id,
          currency: String(body.currency ?? 'usd'),
          type: String(body.card_form ?? 'virtual'),
          status: 'active',
          'metadata[card_request_id]': requestId,
          'metadata[brand_requested]': cardRequest.card_type,
        }),
      });

      // 3. Sensitive details (requires the card to be virtual)
      let number: string | null = null;
      let cvc: string | null = null;
      try {
        const full = await stripe(
          `/issuing/cards/${card.id}?expand[]=number&expand[]=cvc`,
          stripeKey,
        );
        number = full.number ?? null;
        cvc = full.cvc ?? null;
      } catch {
        // Account may not be permitted to read PANs via API — keep last4 only.
      }

      const { error: updErr } = await admin
        .from('card_requests')
        .update({
          status: 'issued',
          issued_at: new Date().toISOString(),
          card_number: number,
          cvv: cvc,
          expiry_month: card.exp_month,
          expiry_year: card.exp_year,
          issued_reference: card.id,
          issued_last_four: card.last4,
          issued_display_number: `•••• •••• •••• ${card.last4}`,
          admin_note: body.admin_note ? String(body.admin_note) : cardRequest.admin_note,
        })
        .eq('id', requestId);
      if (updErr) throw updErr;

      return json({
        success: true,
        card_id: card.id,
        last4: card.last4,
        brand: card.brand,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        pan_available: !!number,
      });
    }

    // ---- freeze / unfreeze / cancel -------------------------------------------
    if (action === 'set_card_status') {
      const cardId = String(body.card_id ?? '');
      const status = String(body.status ?? '');
      if (!cardId || !['active', 'inactive', 'canceled'].includes(status)) {
        return json({ error: 'card_id and a valid status are required' }, 400);
      }
      const card = await stripe(`/issuing/cards/${cardId}`, stripeKey, {
        method: 'POST',
        body: form({ status }),
      });
      return json({ success: true, status: card.status });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    console.error('stripe-issuing error', e);
    return json({ error: e instanceof Error ? e.message : 'Unexpected error' }, 500);
  }
});
