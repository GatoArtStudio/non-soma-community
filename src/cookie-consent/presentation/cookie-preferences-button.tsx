"use client";

import { reopenConsentBanner } from "./use-cookie-consent";

export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={reopenConsentBanner} className={className}>
      Preferencias de cookies
    </button>
  );
}
