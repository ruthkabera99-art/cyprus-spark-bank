// Global capture of the browser's install prompt.
// `beforeinstallprompt` often fires before any React component mounts,
// so we capture it at module load and share it app-wide.

import { trackEvent, InstallEvents } from '@/lib/analytics';

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredPrompt: BIPEvent | null = null;
let installed = false;
/** Where the current install attempt came from (button, /install page, auto). */
let lastSource = 'unknown';
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as any).standalone === true);

if (typeof window !== 'undefined') {
  installed = isStandalone();

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BIPEvent;
    trackEvent(InstallEvents.Available, { platform: navigator.platform });
    notify();
  });

  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
    trackEvent(InstallEvents.Installed, { source: lastSource });
    notify();
  });
}

export const subscribeInstall = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const getInstallState = () => ({ canInstall: !!deferredPrompt, installed });

/** Fires the native install prompt. Returns the user's choice. */
export const promptInstall = async (
  source = 'unknown',
): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
  lastSource = source;
  if (!deferredPrompt) {
    trackEvent(InstallEvents.PromptUnavailable, { source });
    return 'unavailable';
  }
  try {
    trackEvent(InstallEvents.PromptShown, { source });
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    trackEvent(
      outcome === 'accepted' ? InstallEvents.PromptAccepted : InstallEvents.PromptDismissed,
      { source },
    );
    notify();
    return outcome;
  } catch (err) {
    deferredPrompt = null;
    trackEvent(InstallEvents.PromptUnavailable, { source, error: String(err) });
    notify();
    return 'unavailable';
  }
};

