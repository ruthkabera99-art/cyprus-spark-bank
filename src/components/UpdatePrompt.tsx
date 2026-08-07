import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  applyUpdate,
  dismissUpdate,
  getUpdateState,
  subscribeUpdate,
} from "@/lib/swUpdate";

export function UpdatePrompt() {
  const [{ updateAvailable }, setState] = useState(getUpdateState);
  const [applying, setApplying] = useState(false);

  useEffect(() => subscribeUpdate(() => setState(getUpdateState())), []);

  if (!updateAvailable) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-md rounded-xl border border-border bg-card p-4 shadow-lg sm:left-auto sm:right-4 sm:mx-0"
    >
      <div className="flex items-start gap-3">
        <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Update available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            A newer, more secure version of MorganFinance is ready.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              disabled={applying}
              onClick={() => {
                setApplying(true);
                applyUpdate();
              }}
            >
              {applying ? "Updating…" : "Update now"}
            </Button>
            <Button size="sm" variant="ghost" onClick={dismissUpdate}>
              Later
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss update notice"
          onClick={dismissUpdate}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
