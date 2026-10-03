import { useSiteSettings } from '@/hooks/useSiteSettings';

/** Editable website content. Stored as key/value rows in site_settings, edited from the admin panel. */
export const CONTENT_DEFAULTS = {
  brand_name: 'MorganFinance Bank',
  brand_tagline: 'Trust & Innovation',
  topbar_badge: 'SSL Encrypted',

  hero_chip: 'Secure digital banking',
  hero_title: 'Online Banking',
  hero_title_highlight: 'Built on Trust',
  hero_subtitle:
    'Open a checking, savings, or business account with MorganFinance Bank. Get fast transfers, collateral-backed loans, and secure digital banking around the clock.',
  hero_benefits: 'No hidden fees\n24/7 customer support\nBank-grade encryption\nReal-time notifications',
  hero_cta_primary: 'Get Started',
  hero_cta_secondary: 'Login to Your Account',
  hero_image_url: '',

  stats: '24/7|Customer Support\n256-bit|Encryption\n4|Collateral Types\n99.9%|Uptime Target',
  disclaimer_text:
    'Loan products are subject to credit approval. Rates, terms, and conditions are subject to change without notice. All financial products carry risk. Collateral-backed loans carry the risk of collateral liquidation upon default. Please review all terms and conditions before applying.',

  section_partners: 'on',
  section_how: 'on',
  section_services: 'on',
  section_features: 'on',
  section_stats: 'on',
  section_trust: 'on',
  section_testimonials: 'on',
  section_faq: 'on',
  section_download: 'on',
  section_cta: 'on',
  section_disclaimer: 'on',

  footer_about: 'Secure, innovative financial solutions for individuals and businesses.',
  footer_copyright: 'MorganFinance Bank. All rights reserved.',
  social_facebook: '',
  social_twitter: '',
  social_linkedin: '',
  social_instagram: '',
};

export type ContentKey = keyof typeof CONTENT_DEFAULTS;
export type SiteContent = Record<ContentKey, string>;

export const HOME_SECTIONS: { key: ContentKey; label: string }[] = [
  { key: 'section_partners', label: 'Payment partners' },
  { key: 'section_how', label: 'How it works' },
  { key: 'section_services', label: 'Services' },
  { key: 'section_features', label: 'Features' },
  { key: 'section_stats', label: 'Stats band' },
  { key: 'section_trust', label: 'Security badges' },
  { key: 'section_testimonials', label: 'Testimonials' },
  { key: 'section_faq', label: 'FAQ' },
  { key: 'section_download', label: 'Download app' },
  { key: 'section_cta', label: 'Call to action' },
  { key: 'section_disclaimer', label: 'Disclosures' },
];

export function useSiteContent(): SiteContent {
  const { data } = useSiteSettings();
  const out = { ...CONTENT_DEFAULTS } as SiteContent;
  (Object.keys(CONTENT_DEFAULTS) as ContentKey[]).forEach((k) => {
    const v = data?.[k];
    if (typeof v === 'string' && (v.trim() !== '' || k.startsWith('social_') || k === 'hero_image_url')) out[k] = v;
  });
  return out;
}

export const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
export const isOn = (v: string) => v !== 'off';
