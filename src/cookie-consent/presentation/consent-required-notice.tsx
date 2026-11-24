"use client";

import { buttonClasses } from "@/shared/ui/button";
import { saveConsent } from "./use-cookie-consent";

/** Inline prompt shown where an action needs cookies the visitor has not accepted. */
export function ConsentRequiredNotice({ action }: { action: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-700 px-4 py-3 text-sm text-ink-300">
      <p>Para {action} necesitas aceptar las cookies.</p>
      <button
        type="button"
        onClick={() => saveConsent("accepted")}
        className={buttonClasses("secondary")}
      >
        Aceptar cookies
      </button>
    </div>
  );
}
