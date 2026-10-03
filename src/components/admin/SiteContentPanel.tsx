import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save, LayoutTemplate } from 'lucide-react';
import { useUpdateSiteSettings } from '@/hooks/useSiteSettings';
import { useSiteContent, HOME_SECTIONS, isOn, type ContentKey, type SiteContent } from '@/hooks/useSiteContent';

type Field = { key: ContentKey; label: string; multiline?: boolean; hint?: string };

const GROUPS: Record<string, Field[]> = {
  header: [
    { key: 'brand_name', label: 'Brand name' },
    { key: 'brand_tagline', label: 'Tagline under logo' },
    { key: 'topbar_badge', label: 'Top bar badge text' },
  ],
  hero: [
    { key: 'hero_chip', label: 'Small label above title' },
    { key: 'hero_title', label: 'Title' },
    { key: 'hero_title_highlight', label: 'Highlighted title words' },
    { key: 'hero_subtitle', label: 'Subtitle', multiline: true },
    { key: 'hero_benefits', label: 'Benefits', multiline: true, hint: 'One per line' },
    { key: 'hero_cta_primary', label: 'Main button text' },
    { key: 'hero_cta_secondary', label: 'Second button text' },
    { key: 'hero_image_url', label: 'Background image URL', hint: 'Leave empty for the default photo' },
  ],
  body: [
    { key: 'stats', label: 'Stats band', multiline: true, hint: 'One per line: value|label' },
    { key: 'disclaimer_text', label: 'Disclosures text', multiline: true },
  ],
  footer: [
    { key: 'footer_about', label: 'About text', multiline: true },
    { key: 'footer_copyright', label: 'Copyright line', hint: 'Year is added automatically' },
    { key: 'social_facebook', label: 'Facebook URL', hint: 'Empty hides the icon' },
    { key: 'social_twitter', label: 'X / Twitter URL' },
    { key: 'social_linkedin', label: 'LinkedIn URL' },
    { key: 'social_instagram', label: 'Instagram URL' },
  ],
};

export function SiteContentPanel() {
  const content = useSiteContent();
  const update = useUpdateSiteSettings();
  const [form, setForm] = useState<SiteContent>(content);
  const serialized = JSON.stringify(content);

  useEffect(() => setForm(JSON.parse(serialized)), [serialized]);

  const set = (k: ContentKey, v: string) => setForm((f) => ({ ...f, [k]: v.slice(0, 2000) }));

  const save = async () => {
    for (const k of ['social_facebook', 'social_twitter', 'social_linkedin', 'social_instagram', 'hero_image_url'] as ContentKey[]) {
      const v = form[k].trim();
      if (v && !/^https?:\/\//i.test(v) && !v.startsWith('/')) {
        toast.error(`${k.replace(/_/g, ' ')} must start with https://`);
        return;
      }
    }
    try {
      await update.mutateAsync(form);
      toast.success('Website content saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save content');
    }
  };

  const renderFields = (fields: Field[]) => (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key} className={f.multiline ? 'md:col-span-2 space-y-1.5' : 'space-y-1.5'}>
          <Label htmlFor={f.key}>{f.label}</Label>
          {f.multiline ? (
            <Textarea id={f.key} rows={4} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          ) : (
            <Input id={f.key} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          )}
          {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-primary" /> Website content</CardTitle>
          <CardDescription>Edit the header, homepage hero, page sections and footer.</CardDescription>
        </div>
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save content
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="header">
          <TabsList className="mb-4">
            <TabsTrigger value="header">Header</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
          </TabsList>
          <TabsContent value="header">{renderFields(GROUPS.header)}</TabsContent>
          <TabsContent value="hero">{renderFields(GROUPS.hero)}</TabsContent>
          <TabsContent value="body" className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-3">Homepage sections</h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {HOME_SECTIONS.map((s) => (
                  <label key={s.key} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                    {s.label}
                    <Switch checked={isOn(form[s.key])} onCheckedChange={(c) => set(s.key, c ? 'on' : 'off')} />
                  </label>
                ))}
              </div>
            </div>
            {renderFields(GROUPS.body)}
          </TabsContent>
          <TabsContent value="footer">{renderFields(GROUPS.footer)}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
