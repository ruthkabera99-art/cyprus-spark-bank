import { useEffect, useState, useCallback } from 'react';
import {
  getInstallState,
  subscribeInstall,
  promptInstall,
} from '@/lib/pwaInstall';

export function useInstallPrompt() {
  const [state, setState] = useState(getInstallState);

  useEffect(() => {
    const update = () => setState(getInstallState());
    update();
    const unsub = subscribeInstall(update);
    // Chrome can fire beforeinstallprompt slightly after first paint
    const t = setTimeout(update, 1200);
    return () => {
      unsub();
      clearTimeout(t);
    };
  }, []);

  const install = useCallback(() => promptInstall(), []);

  return { ...state, install };
}
