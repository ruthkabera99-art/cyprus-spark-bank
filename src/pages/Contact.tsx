import { useState } from 'react';
import { z } from 'zod';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useSiteSettings, DAYS } from '@/hooks/useSiteSettings';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(100, 'Name must be under 100 characters'),
  email: z.string().trim().email('Enter a valid email address').max(255, 'Email must be under 255 characters'),
  subject: z.string().trim().min(1, 'Please enter a subject').max(150, 'Subject must be under 150 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be under 1000 characters'),
});

type FormValues = z.infer<typeof contactSchema>;

const EMPTY: FormValues = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const { data: settings } = useSiteSettings();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  const phone = settings?.contact_phone ?? '+1 (800) 123-4567';
  const email = settings?.contact_email ?? 'support@morganfinancebank.com';
  const address = settings?.contact_address ?? '123 Financial District, Banking Tower, City Center';

  const set = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(values);
    if (!result.success) {
      const next: Partial<Record<keyof FormValues, string>> = {};
      result.error.issues.forEach((i) => {
        const key = i.path[0] as keyof FormValues;
        if (!next[key]) next[key] = i.message;
      });
      setErrors(next);
      toast.error('Please fix the highlighted fields');
      return;
    }
    const d = result.data;
    const body = `Name: ${d.name}\nEmail: ${d.email}\n\n${d.message}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(body)}`;
    toast.success('Opening your email app to send the message');
    setValues(EMPTY);
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
              <h2 className="text-2xl font-serif font-bold text-foreground">Send us a message</h2>
              <p className="text-muted-foreground mt-1 mb-6 text-sm">
                Never share passwords, PINs or full card numbers with us.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={values.name} onChange={set('name')} maxLength={100} placeholder="Jane Doe" />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={values.email} onChange={set('email')} maxLength={255} placeholder="jane@example.com" />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={values.subject} onChange={set('subject')} maxLength={150} placeholder="Question about a collateral loan" />
                  {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={6} value={values.message} onChange={set('message')} maxLength={1000} placeholder="How can we help?" />
                  <div className="flex justify-between">
                    {errors.message ? <p className="text-sm text-destructive">{errors.message}</p> : <span />}
                    <span className="text-xs text-muted-foreground">{values.message.length}/1000</span>
                  </div>
                </div>
                <Button type="submit" className="gradient-primary shadow-elegant w-full sm:w-auto">Send message</Button>
              </form>
              <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Your details are only used to answer your enquiry.</p>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
