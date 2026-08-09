import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Turnstile'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  /** Increment to force a widget reset (e.g. after a failed submit). */
  resetSignal?: number;
  className?: string;
}

export function Turnstile({ siteKey, onVerify, onExpire, resetSignal = 0, className }: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const verifyRef = useRef(onVerify);
  const expireRef = useRef(onExpire);
  verifyRef.current = onVerify;
  expireRef.current = onExpire;

  useEffect(() => {
    let cancelled = false;
    if (!siteKey) return;

    loadTurnstile()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          theme: 'auto',
          callback: (token: string) => verifyRef.current(token),
          'expired-callback': () => expireRef.current?.(),
          'error-callback': () => expireRef.current?.(),
        });
      })
      .catch(() => {
        /* network blocked — submit will fail server-side verification */
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* noop */
        }
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetSignal > 0 && widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
    }
  }, [resetSignal]);

  return <div ref={ref} className={className} />;
}
