"use client";

import { useCallback, useEffect, useRef } from "react";
import type { HumanAction } from "@/bot-protection/domain/human-verifier.port";
import { loadTurnstile, type TurnstileApi } from "./turnstile-client";

interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

/**
 * Runs a Turnstile challenge on demand (e.g. when clicking a like button). The widget only
 * becomes visible if Cloudflare needs the visitor to interact with it.
 */
export function useInvisibleTurnstile(siteKey: string, action: HumanAction) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<{ api: TurnstileApi; id: string } | null>(null);
  const pendingRef = useRef<PendingRequest | null>(null);

  useEffect(() => {
    return () => {
      if (widgetRef.current) widgetRef.current.api.remove(widgetRef.current.id);
      widgetRef.current = null;
    };
  }, []);

  const getToken = useCallback(async (): Promise<string> => {
    const api = await loadTurnstile();
    if (!containerRef.current) throw new Error("Turnstile container is not mounted");

    if (!widgetRef.current) {
      const id = api.render(containerRef.current, {
        sitekey: siteKey,
        action,
        theme: "dark",
        language: "es",
        appearance: "interaction-only",
        execution: "execute",
        "response-field": false,
        callback: (token) => {
          pendingRef.current?.resolve(token);
          pendingRef.current = null;
        },
        "error-callback": () => {
          pendingRef.current?.reject(new Error("Turnstile challenge failed"));
          pendingRef.current = null;
        },
      });
      widgetRef.current = { api, id };
    } else {
      api.reset(widgetRef.current.id);
    }

    const { id } = widgetRef.current;
    return new Promise<string>((resolve, reject) => {
      pendingRef.current = { resolve, reject };
      api.execute(id);
    });
  }, [siteKey, action]);

  return { containerRef, getToken };
}
