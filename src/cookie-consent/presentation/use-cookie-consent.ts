"use client";

import { useSyncExternalStore } from "react";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  parseConsent,
  type ConsentChoice,
  type ConsentState,
} from "@/cookie-consent/domain/consent";
import { forgetDeviceAction } from "./consent.actions";

const CHANGE_EVENT = "nsc:cookie-consent-change";

function readConsent(): ConsentState {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  return parseConsent(match?.[1]);
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function writeConsent(value: string, maxAge: number): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useCookieConsent(): ConsentState {
  return useSyncExternalStore(subscribe, readConsent, () => "pending");
}

export function saveConsent(choice: ConsentChoice): void {
  writeConsent(choice, CONSENT_MAX_AGE_SECONDS);
  if (choice === "rejected") void forgetDeviceAction();
}

/** Clears the stored choice so the banner asks again. */
export function reopenConsentBanner(): void {
  writeConsent("", 0);
}
