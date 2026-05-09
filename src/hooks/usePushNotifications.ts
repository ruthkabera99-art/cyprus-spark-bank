import { useCallback, useEffect, useState } from 'react';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

const STORAGE_KEY = 'push-notifications-enabled';

export function usePushNotifications() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PermissionState);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result as PermissionState);
    if (result === 'granted') {
      localStorage.setItem(STORAGE_KEY, 'true');
      setEnabled(true);
      return true;
    }
    return false;
  }, []);

  const disable = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'false');
    setEnabled(false);
  }, []);

  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (!('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;
      if (!enabled) return;

      // iOS Safari / iOS PWAs don't support notification `actions` and
      // require notifications to be shown via the service worker registration.
      const ua = navigator.userAgent || '';
      const isIOS = /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);

      const opts: NotificationOptions = {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
      };

      if (isIOS && 'actions' in opts) {
        // Strip unsupported fields on iOS to avoid silent failures
        delete (opts as any).actions;
        delete (opts as any).requireInteraction;
      }

      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            await reg.showNotification(title, opts);
            return;
          }
        }
        // Fallback for non-SW contexts (not iOS — iOS requires SW)
        if (!isIOS) new Notification(title, opts);
      } catch {
        // Silent fail - some browsers (iOS Safari) only allow SW notifications
      }
    },
    [enabled],
  );

  return {
    permission,
    enabled: enabled && permission === 'granted',
    isSupported: permission !== 'unsupported',
    requestPermission,
    disable,
    showNotification,
  };
}
