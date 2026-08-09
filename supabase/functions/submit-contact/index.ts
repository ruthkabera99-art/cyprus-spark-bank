import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(150),
  message: z.string().trim().min(10).max(1000),
  token: z.string().min(1).max(4096),
  // Honeypot: must be empty for real humans.
  company: z.string().max(200).optional().default(''),
  // Milliseconds the form was on screen before submit.
  elapsedMs: z.number().int().nonnegative().optional().default(0),
});

const BANNED_PATTERNS = [
  /\bhttps?:\/\/\S+/gi,
  /\b(viagra|casino|crypto\s*giveaway|seo\s*services|backlinks|loan\s*offer\s*bot)\b/i,
  /\[url=/i,
  /<a\s+href=/i,
];

function looksAbusive(subject: string, message: string) {
  const text = `${subject}\n${message}`;
  const links = text.match(/\bhttps?:\/\/\S+/gi) ?? [];
  if (links.length >= 2) return 'too many links';
  for (const p of BANNED_PATTERNS.slice(1)) {
    if (p.test(text)) return 'blocked content';
  }
  // Repeated-character / gibberish spam
  if (/(.)\1{15,}/.test(text)) return 'repeated characters';
  const letters = text.replace(/[^a-zA-Z]/g, '').length;
  if (letters < text.length * 0.4) return 'low text quality';
  return null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const raw = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return json({ error: 'Invalid submission', fields: parsed.error.flatten().fieldErrors }, 400);
    }
    const { name, email, subject, message, token, company, elapsedMs } = parsed.data;

    const ip =
      req.headers.get('cf-connecting-ip') ??
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      'unknown';
    const userAgent = req.headers.get('user-agent') ?? '';

    // 1. Honeypot — silently accept so bots don't learn.
    if (company.trim() !== '') {
      console.log('honeypot triggered', { ip });
      return json({ success: true });
    }

    // 2. Too-fast submission (bots fill instantly).
    if (elapsedMs > 0 && elapsedMs < 2500) {
      return json({ error: 'Submission was too fast. Please try again.' }, 429);
    }

    // 3. Cloudflare Turnstile verification.
    const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
    if (!secret) {
      console.error('TURNSTILE_SECRET_KEY not configured');
      return json({ error: 'Spam protection is not configured. Please try again later.' }, 500);
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const verify = await verifyRes.json();
    if (!verify.success) {
      console.log('turnstile failed', verify['error-codes']);
      return json({ error: 'Verification failed. Please complete the challenge again.' }, 403);
    }

    // 4. Content heuristics.
    const abuse = looksAbusive(subject, message);
    if (abuse) {
      console.log('blocked abusive content', { ip, abuse });
      return json({ error: 'Your message was blocked by our spam filter.' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 5. Rate limit: max 3 messages per IP and 3 per email in 60 minutes.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const [{ count: ipCount }, { count: emailCount }] = await Promise.all([
      supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', since),
      supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('email', email)
        .gte('created_at', since),
    ]);

    if ((ipCount ?? 0) >= 3 || (emailCount ?? 0) >= 3) {
      return json(
        { error: 'You have sent several messages recently. Please wait an hour before sending another.' },
        429,
      );
    }

    // 6. Duplicate suppression.
    const { count: dupeCount } = await supabase
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .eq('message', message)
      .gte('created_at', since);
    if ((dupeCount ?? 0) > 0) {
      return json({ error: 'We already received this message. Our team will reply shortly.' }, 409);
    }

    const { error } = await supabase.from('contact_messages').insert({
      name,
      email,
      subject,
      message,
      ip_address: ip,
      user_agent: userAgent.slice(0, 500),
    });
    if (error) {
      console.error('insert failed', error);
      return json({ error: 'Could not save your message. Please try again.' }, 500);
    }

    return json({ success: true });
  } catch (e) {
    console.error('submit-contact error', e);
    return json({ error: 'Unexpected error. Please try again.' }, 500);
  }
});
