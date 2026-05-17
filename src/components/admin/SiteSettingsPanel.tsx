import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { useSiteSettings, useUpdateSiteSettings, type SiteSettings } from '@/hooks/useSiteSettings';

export function SiteSettingsPanel() {
  const { data, isLoading } = useSiteSettings();
  const update = useUpdateSiteSettings();
  const [form, setForm] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const set = (key: keyof SiteSettings, value: string) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const handleSave = async () => {
    try {
      await update.mutateAsync(form);
      toast.success('Site settings saved');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to save settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Contact Settings</CardTitle>
        <CardDescription>
          Update the phone number, email, and address shown across the public site (top bar, footer, contact pages, FAQ, CTA).
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
          />
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
          />
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
          />
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="contact_hours" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Business hours
            </Label>
            <Input
              id="contact_hours"
              value={form.contact_hours}
              onChange={(e) => set('contact_hours', e.target.value)}
              placeholder="Mon–Fri, 9 AM – 5 PM"
            />
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
            />
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
