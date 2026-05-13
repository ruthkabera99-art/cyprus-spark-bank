import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Register service worker only in production standalone PWA mode
const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if ("serviceWorker" in navigator && !isInIframe && !isPreviewHost) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });

  // iOS-safe deep link fallback: when the SW can't navigate the client
  // directly (common on iOS), it posts a message and we route in-app.
  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data;
    if (data && data.type === "navigate" && typeof data.url === "string") {
      try {
        const u = new URL(data.url, window.location.origin);
        if (u.origin === window.location.origin) {
          window.history.pushState({}, "", u.pathname + u.search + u.hash);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      } catch {}
    }
  });
} else if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((regs) =>
    regs.forEach((r) => r.unregister())
  );
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
