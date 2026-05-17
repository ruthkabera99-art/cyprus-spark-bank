import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type SiteSettings = {
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  contact_hours: string;
  nmls_number: string;
  [key: string]: string;
};

const DEFAULTS: SiteSettings = {
  contact_phone: '+1 (800) 123-4567',
  contact_email: 'support@morganfinancebank.com',
  contact_address: '123 Financial District, Banking Tower, City Center',
  contact_hours: 'Mon–Fri, 9 AM – 5 PM',
  nmls_number: '123456',
};

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
