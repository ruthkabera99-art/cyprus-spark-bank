import { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock, Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSiteSettings, DAYS } from '@/hooks/useSiteSettings';
import { Turnstile } from '@/components/Turnstile';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const DISPOSABLE_DOMAINS = ['mailinator.com', 'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'yopmail.com', 'trashmail.com'];

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name (at least 2 characters)')
    .max(100, 'Name must be under 100 characters')
    .regex(/^[\p{L}][\p{L}\s'.-]*$/u, 'Name can only contain letters, spaces, apostrophes and hyphens'),
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address')
    .email('Enter a valid email address, e.g. jane@example.com')
    .max(255, 'Email must be under 255 characters')
    .refine((v) => !DISPOSABLE_DOMAINS.includes(v.split('@')[1]?.toLowerCase() ?? ''), 'Please use a permanent email address so we can reply'),
  phone: z
    .string()
    .trim()
    .max(25, 'Phone number must be under 25 characters')
    .refine((v) => v === '' || /^[+]?[\d\s().-]{7,25}$/.test(v), 'Enter a valid phone number, or leave it blank')
    .optional()
    .default(''),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(150, 'Subject must be under 150 characters'),
  message: z
    .string()
    .trim()
    .min(20, 'Please give us a little more detail (at least 20 characters)')
    .max(1000, 'Message must be under 1000 characters')
    .refine((v) => v.split(/\s+/).filter(Boolean).length >= 5, 'Please write at least 5 words')
    .refine((v) => !/(.)\1{9,}/.test(v), 'Message looks like repeated characters'),
});

type FormValues = z.infer<typeof contactSchema>;
type FieldKey = keyof FormValues;

const EMPTY: FormValues = { name: '', email: '', phone: '', subject: '', message: '' };

export default function Contact() {
  const { data: settings } = useSiteSettings();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [resetSignal, setResetSignal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const mountedAt = useRef(Date.now());
  const formTop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const phone = settings?.contact_phone ?? '+1 (800) 123-4567';
  const email = settings?.contact_email ?? 'support@morganfinancebank.com';
  const address = settings?.contact_address ?? '123 Financial District, Banking Tower, City Center';
  const siteKey = (settings?.turnstile_site_key ?? '').trim();

  const validateField = (key: FieldKey, all: FormValues) => {
    const result = contactSchema.safeParse(all);
    const issue = result.success ? undefined : result.error.issues.find((i) => i.path[0] === key);
    setErrors((prev) => ({ ...prev, [key]: issue?.message }));
  };

  const set = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    if (touched[key]) validateField(key, next);
  };

  const blur = (key: FieldKey) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    validateField(key, values);
  };

  const fieldProps = (key: FieldKey) => ({
    onBlur: blur(key),
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
    className: cn(errors[key] && 'border-destructive focus-visible:ring-destructive'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(values);
    if (!result.success) {
      const next: Partial<Record<FieldKey, string>> = {};
      result.error.issues.forEach((i) => {
        const key = i.path[0] as FieldKey;
        if (!next[key]) next[key] = i.message;
      });
      setErrors(next);
      setTouched({ name: true, email: true, phone: true, subject: true, message: true });
      toast.error('Please fix the highlighted fields');
      const first = document.getElementById(Object.keys(next)[0]);
      first?.focus();
      return;
    }

    if (siteKey && !captchaToken) {
      setCaptchaError('Please complete the security check before sending');
      toast.error('Please complete the security check');
      return;
    }
    setCaptchaError('');

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-contact', {
        body: {
          name: result.data.name,
          email: result.data.email,
          subject: result.data.subject,
          message: result.data.phone
            ? `${result.data.message}\n\nPhone: ${result.data.phone}`
            : result.data.message,
          token: captchaToken,
          company: honeypot,
          elapsedMs: Date.now() - mountedAt.current,
        },
      });

      if (error) {
        let msg = 'Could not send your message. Please try again.';
        const res = (error as { context?: Response }).context;
        if (res && typeof res.json === 'function') {
          const body = await res.json().catch(() => null);
          if (body?.error) msg = body.error;
        }
        throw new Error(msg);
      }
      if (data && (data as { error?: string }).error) {
        throw new Error((data as { error: string }).error);
      }

      toast.success('Message sent — our team will reply shortly');
      setSentTo(result.data.email);
      setSubmitted(true);
      setValues(EMPTY);
      setErrors({});
      setTouched({});
      setCaptchaToken('');
      setResetSignal((n) => n + 1);
      mountedAt.current = Date.now();
      formTop.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send your message');
      setCaptchaToken('');
      setResetSignal((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact MorganFinance Bank',
    url: 'https://morganfinance.us/contact',
    mainEntity: {
      '@type': 'Organization',
      name: 'MorganFinance Bank',
      email,
      telephone: phone,
      address: { '@type': 'PostalAddress', streetAddress: address },
      contactPoint: [{ '@type': 'ContactPoint', telephone: phone, contactType: 'customer support', email }],
    },
  };

  const FieldError = ({ id, message }: { id: string; message?: string }) =>
    message ? (
      <p id={`${id}-error`} className="flex items-center gap-1.5 text-sm text-destructive">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        {message}
      </p>
    ) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Contact MorganFinance Bank — Support, Phone & Address"
        description="Reach the MorganFinance Bank team by phone, email or message. See our support hours, head office address and get a reply from a banking specialist."
        path="/contact"
        jsonLd={jsonLd}
      />
      <Header />

      <main className="flex-1">
        <section className="gradient-primary py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary-foreground">Contact MorganFinance Bank</h1>
            <p className="mt-4 max-w-2xl mx-auto text-primary-foreground/90">
              Talk to a banking specialist about accounts, transfers, or collateral-backed loans. We reply to every message.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 grid gap-8 lg:grid-cols-5">
            {/* Details */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6 flex gap-4">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-foreground">Phone</h2>
                  <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="text-muted-foreground hover:text-primary">{phone}</a>
                </div>
              </Card>
              <Card className="p-6 flex gap-4">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-foreground">Email</h2>
                  <a href={`mailto:${email}`} className="text-muted-foreground hover:text-primary break-all">{email}</a>
                </div>
              </Card>
              <Card className="p-6 flex gap-4">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-foreground">Head Office</h2>
                  <p className="text-muted-foreground">{address}</p>
                </div>
              </Card>
              <Card className="p-6 flex gap-4">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div className="w-full">
                  <h2 className="font-semibold text-foreground mb-2">Business Hours</h2>
                  <ul className="space-y-1 text-sm">
                    {DAYS.map((d) => (
                      <li key={d.key} className="flex justify-between gap-4 text-muted-foreground">
                        <span>{d.label}</span>
                        <span>{settings?.[`hours_${d.key}`] || 'Closed'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>

            {/* Form */}
            <Card className="lg:col-span-3 p-6 md:p-8">
              <div ref={formTop} />
              {submitted ? (
                <div className="py-8 text-center" role="status" aria-live="polite">
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="mt-5 text-2xl font-serif font-bold text-foreground">Message received</h2>
                  <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                    Thanks for reaching out. A MorganFinance banking specialist will reply to{' '}
                    <span className="font-medium text-foreground break-all">{sentTo}</span> — usually within one business day.
                  </p>
                  <ul className="mt-6 text-sm text-muted-foreground space-y-1">
                    <li>Reference: your email address</li>
                    <li>Need help sooner? Call {phone}</li>
                  </ul>
                  <Button variant="outline" className="mt-7" onClick={() => setSubmitted(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-serif font-bold text-foreground">Send us a message</h2>
                  <p className="text-muted-foreground mt-1 mb-6 text-sm">
                    Never share passwords, PINs or full card numbers with us.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input id="name" value={values.name} onChange={set('name')} maxLength={100} placeholder="Jane Doe" autoComplete="name" {...fieldProps('name')} />
                        <FieldError id="name" message={errors.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={values.email} onChange={set('email')} maxLength={255} placeholder="jane@example.com" autoComplete="email" {...fieldProps('email')} />
                        <FieldError id="email" message={errors.email} />
                      </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input id="phone" type="tel" value={values.phone} onChange={set('phone')} maxLength={25} placeholder="+1 800 123 4567" autoComplete="tel" {...fieldProps('phone')} />
                        <FieldError id="phone" message={errors.phone} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" value={values.subject} onChange={set('subject')} maxLength={150} placeholder="Question about a collateral loan" {...fieldProps('subject')} />
                        <FieldError id="subject" message={errors.subject} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" rows={6} value={values.message} onChange={set('message')} maxLength={1000} placeholder="How can we help?" {...fieldProps('message')} />
                      <div className="flex justify-between gap-4">
                        <FieldError id="message" message={errors.message} />
                        <span className={cn('text-xs shrink-0 ml-auto', values.message.length > 950 ? 'text-destructive' : 'text-muted-foreground')}>
                          {values.message.length}/1000
                        </span>
                      </div>
                    </div>

                    {/* Honeypot — hidden from humans, tempting to bots */}
                    <div className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden" aria-hidden="true">
                      <label htmlFor="company">Company (leave blank)</label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </div>

                    {siteKey ? (
                      <div className="space-y-2">
                        <Turnstile
                          siteKey={siteKey}
                          onVerify={(t) => {
                            setCaptchaToken(t);
                            setCaptchaError('');
                          }}
                          onExpire={() => setCaptchaToken('')}
                          resetSignal={resetSignal}
                        />
                        <FieldError id="captcha" message={captchaError} />
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Security check unavailable — add your Turnstile site key in Admin → Settings.
                      </p>
                    )}

                    <Button type="submit" disabled={submitting} className="gradient-primary shadow-elegant w-full sm:w-auto">
                      {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {submitting ? 'Sending…' : 'Send message'}
                    </Button>
                  </form>
                  <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Protected by Cloudflare Turnstile. Your details are only used to answer your enquiry.</p>
                  </div>
                </>
              )}
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
