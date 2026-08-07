// Global capture of the browser's install prompt.
// `beforeinstallprompt` often fires before any React component mounts,
// so we capture it at module load and share it app-wide.

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredPrompt: BIPEvent | null = null;
let installed = false;
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
    notify();
  });

  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
    notify();
  });
}

export const subscribeInstall = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const getInstallState = () => ({ canInstall: !!deferredPrompt, installed });

/** Fires the native install prompt. Returns true when the user accepted. */
export const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
  if (!deferredPrompt) return 'unavailable';
  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notify();
    return outcome;
  } catch {
    deferredPrompt = null;
    notify();
    return 'unavailable';
  }
};
