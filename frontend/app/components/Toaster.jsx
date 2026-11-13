"use client";

import { useSyncExternalStore } from "react";
import {
  dismissToast,
  getServerToasts,
  getToasts,
  subscribeToasts,
} from "../utilities/toast";

function Toaster() {
  const toasts = useSyncExternalStore(
    subscribeToasts,
    getToasts,
    getServerToasts,
  );

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-slate-800 shadow-lg ring-1 ring-slate-200"
        >
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
              t.type === "error" ? "bg-red-500" : "bg-emerald-500"
            }`}
          />
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            aria-label="Dismiss"
            className="-mr-1 rounded-md px-1.5 text-lg leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={() => dismissToast(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toaster;
