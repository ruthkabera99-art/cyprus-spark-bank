// Service worker registration + background update checking.
// Installed users get a clear "Update available" prompt when a new
// version of the banking site has been deployed.

let registration: ServiceWorkerRegistration | null = null;
let waitingWorker: ServiceWorker | null = null;
let reloading = false;

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** How often to ask the browser to check for a new service worker. */
const UPDATE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export const subscribeUpdate = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const getUpdateState = () => ({ updateAvailable: !!waitingWorker });

/** Applies the pending update and reloads the app. */
export const applyUpdate = () => {
  if (!waitingWorker) {
    window.location.reload();
    return;
  }
  waitingWorker.postMessage({ type: "SKIP_WAITING" });
};

export const dismissUpdate = () => {
  waitingWorker = null;
  notify();
};

function trackWaiting(reg: ServiceWorkerRegistration) {
  if (reg.waiting && navigator.serviceWorker.controller) {
    waitingWorker = reg.waiting;
    notify();
  }
}

function watchInstalling(reg: ServiceWorkerRegistration) {
  const installing = reg.installing;
  if (!installing) return;
  installing.addEventListener("statechange", () => {
    if (installing.state === "installed" && navigator.serviceWorker.controller) {
      waitingWorker = installing;
      notify();
    }
  });
}

export function registerServiceWorkerWithUpdates(path = "/sw.js") {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  navigator.serviceWorker
    .register(path)
    .then((reg) => {
      registration = reg;
      trackWaiting(reg);
      watchInstalling(reg);

      reg.addEventListener("updatefound", () => watchInstalling(reg));

      // Background checks: on an interval, when the tab regains focus,
      // and whenever the network comes back online.
      const check = () => reg.update().catch(() => {});
      setInterval(check, UPDATE_INTERVAL_MS);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") check();
      });
      window.addEventListener("online", check);
      check();
    })
    .catch(() => {});
}

export const checkForUpdateNow = () => registration?.update().catch(() => {});
