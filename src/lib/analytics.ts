// Lightweight analytics dispatcher.
// Forwards events to any provider present on the page (gtag / dataLayer / PostHog),
// and keeps a small local funnel record so install conversion can be inspected
// even before an external analytics provider is connected.

type Props = Record<string, unknown>;

const STORAGE_KEY = 'mf_analytics_events';
const MAX_STORED = 100;

const persist = (event: string, props: Props) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: unknown[] = raw ? JSON.parse(raw) : [];
    list.push({ event, props, ts: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_STORED)));
  } catch {
    /* storage unavailable — non-fatal */
  }
};

export const trackEvent = (event: string, props: Props = {}) => {
  if (typeof window === 'undefined') return;

  const payload: Props = {
    ...props,
    page_path: window.location.pathname,
    display_mode: window.matchMedia('(display-mode: standalone)').matches
      ? 'standalone'
      : 'browser',
  };

  const w = window as any;
  try {
    if (typeof w.gtag === 'function') w.gtag('event', event, payload);
    else if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event, ...payload });
    if (w.posthog?.capture) w.posthog.capture(event, payload);
  } catch {
    /* provider errors must never break the UI */
  }

  persist(event, payload);

  if (import.meta.env.DEV) console.debug('[analytics]', event, payload);
};

/** Reads the locally stored event log (useful for debugging the install funnel). */
export const getStoredEvents = (): Array<{ event: string; props: Props; ts: string }> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

/** Install funnel event names, kept in one place so reports stay consistent. */
export const InstallEvents = {
  Available: 'pwa_install_available',
  DownloadClick: 'pwa_download_click',
  PromptShown: 'pwa_install_prompt_shown',
  PromptAccepted: 'pwa_install_prompt_accepted',
  PromptDismissed: 'pwa_install_prompt_dismissed',
  PromptUnavailable: 'pwa_install_prompt_unavailable',
  Installed: 'pwa_installed',
} as const;
