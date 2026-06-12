import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
] as const;

export type DayKey = typeof DAYS[number]['key'];

export type SiteSettings = {
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  contact_hours: string;
  nmls_number: string;
  hours_mon: string;
  hours_tue: string;
  hours_wed: string;
  hours_thu: string;
  hours_fri: string;
  hours_sat: string;
  hours_sun: string;
  [key: string]: string;
};

const DEFAULTS: SiteSettings = {
  contact_phone: '+1 (800) 123-4567',
  contact_email: 'support@morganfinancebank.com',
  contact_address: '123 Financial District, Banking Tower, City Center',
  contact_hours: 'Mon–Fri, 9 AM – 5 PM',
  nmls_number: '123456',
  hours_mon: '9:00 AM – 5:00 PM',
  hours_tue: '9:00 AM – 5:00 PM',
  hours_wed: '9:00 AM – 5:00 PM',
  hours_thu: '9:00 AM – 5:00 PM',
  hours_fri: '9:00 AM – 5:00 PM',
  hours_sat: 'Closed',
  hours_sun: 'Closed',
};

const DAY_SHORT: Record<DayKey, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

/** Build a compact summary from per-day hours by grouping consecutive days that share the same value. */
export function formatBusinessHours(s: Partial<SiteSettings> | undefined): string {
  if (!s) return DEFAULTS.contact_hours;
  const values = DAYS.map((d) => ({ key: d.key, value: (s[`hours_${d.key}`] ?? '').trim() }));
  if (values.every((v) => !v.value)) return s.contact_hours ?? DEFAULTS.contact_hours;

  const parts: string[] = [];
  let i = 0;
  while (i < values.length) {
    let j = i;
    while (j + 1 < values.length && values[j + 1].value === values[i].value) j++;
    const v = values[i].value || 'Closed';
    const range = i === j ? DAY_SHORT[values[i].key] : `${DAY_SHORT[values[i].key]}–${DAY_SHORT[values[j].key]}`;
    parts.push(v.toLowerCase() === 'closed' ? `${range}: Closed` : `${range}: ${v}`);
    i = j + 1;
  }
  return parts.join(' · ');
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site_settings'],
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await supabase.from('site_settings').select('key, value');
      if (error) throw error;
      const map: SiteSettings = { ...DEFAULTS };
      (data ?? []).forEach((row: { key: string; value: string }) => {
        map[row.key] = row.value;
      });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<SiteSettings>) => {
      const rows = Object.entries(updates).map(([key, value]) => ({
        key,
        value: value ?? '',
      }));
      const { error } = await supabase
        .from('site_settings')
        .upsert(rows, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site_settings'] });
    },
  });
}
