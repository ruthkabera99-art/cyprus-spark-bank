import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Save, Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';
import {
  useSiteSettings,
  useUpdateSiteSettings,
  type SiteSettings,
  DAYS,
  formatBusinessHours,
} from '@/hooks/useSiteSettings';

const settingsSchema = z.object({
  contact_phone: z
    .string()
    .trim()
    .min(5, 'Phone number is too short')
    .max(30, 'Phone number is too long')
    .regex(/^[+\d\s().-]+$/, 'Phone may only contain digits, spaces, and + ( ) - .'),
  contact_email: z.string().trim().email('Invalid email address').max(255),
  contact_address: z.string().trim().min(5, 'Address is too short').max(300),
  nmls_number: z
    .string()
    .trim()
    .max(20, 'NMLS too long')
    .regex(/^[\d]*$/, 'NMLS must be digits only')
    .optional()
    .or(z.literal('')),
  hours_mon: z.string().trim().max(60),
  hours_tue: z.string().trim().max(60),
  hours_wed: z.string().trim().max(60),
  hours_thu: z.string().trim().max(60),
  hours_fri: z.string().trim().max(60),
  hours_sat: z.string().trim().max(60),
  hours_sun: z.string().trim().max(60),
});

type FieldErrors = Partial<Record<keyof SiteSettings, string>>;

export function SiteSettingsPanel() {
  const { data, isLoading } = useSiteSettings();
  const update = useUpdateSiteSettings();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const summary = useMemo(() => (form ? formatBusinessHours(form) : ''), [form]);

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const set = (key: keyof SiteSettings, value: string) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSave = async () => {
    const result = settingsSchema.safeParse(form);
    if (!result.success) {
      const fe: FieldErrors = {};
      result.error.issues.forEach((i) => {
        const key = i.path[0] as keyof SiteSettings;
        if (!fe[key]) fe[key] = i.message;
      });
      setErrors(fe);
      toast.error('Please fix the highlighted fields before saving');
      return;
    }

    try {
      const payload: Partial<SiteSettings> = {
        ...result.data,
        // Keep legacy single-string summary in sync for any consumer still reading it.
        contact_hours: formatBusinessHours({ ...form, ...result.data }),
      };
      await update.mutateAsync(payload);
      setErrors({});
      toast.success('Site settings saved successfully');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to save settings');
    }
  };

  const fieldError = (key: keyof SiteSettings) =>
    errors[key] ? <p className="text-xs text-destructive">{errors[key]}</p> : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Contact Settings</CardTitle>
        <CardDescription>
          Update the phone number, email, address, and per-day business hours shown across the public site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-2">
          <Label htmlFor="contact_phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" /> Contact phone
          </Label>
          <Input
            id="contact_phone"
            value={form.contact_phone}
            onChange={(e) => set('contact_phone', e.target.value)}
            placeholder="+1 (800) 123-4567"
            aria-invalid={!!errors.contact_phone}
          />
          {fieldError('contact_phone')}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contact_email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> Contact email
          </Label>
          <Input
            id="contact_email"
            type="email"
            value={form.contact_email}
            onChange={(e) => set('contact_email', e.target.value)}
            placeholder="support@morganfinancebank.com"
            aria-invalid={!!errors.contact_email}
          />
          {fieldError('contact_email')}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contact_address" className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Address
          </Label>
          <Textarea
            id="contact_address"
            value={form.contact_address}
            onChange={(e) => set('contact_address', e.target.value)}
            rows={2}
            placeholder="123 Financial District, Banking Tower, City Center"
            aria-invalid={!!errors.contact_address}
          />
          {fieldError('contact_address')}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="nmls_number" className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> NMLS number
          </Label>
          <Input
            id="nmls_number"
            value={form.nmls_number}
            onChange={(e) => set('nmls_number', e.target.value)}
            placeholder="123456"
            aria-invalid={!!errors.nmls_number}
          />
          {fieldError('nmls_number')}
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Business hours</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter hours per day (e.g. <code>9:00 AM – 5:00 PM</code>) or <code>Closed</code>. Leave blank for closed.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {DAYS.map((d) => {
              const key = `hours_${d.key}` as keyof SiteSettings;
              return (
                <div key={d.key} className="grid gap-1.5">
                  <Label htmlFor={key} className="text-sm">{d.label}</Label>
                  <Input
                    id={key}
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder="9:00 AM – 5:00 PM"
                    aria-invalid={!!errors[key]}
                  />
                  {fieldError(key)}
                </div>
              );
            })}
          </div>

          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Preview:</span>{' '}
            <span className="font-medium">{summary || '—'}</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
