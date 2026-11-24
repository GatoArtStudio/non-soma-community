"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { HumanAction } from "@/bot-protection/domain/human-verifier.port";
import { loadTurnstile, type TurnstileApi } from "./turnstile-client";

export { TURNSTILE_FIELD } from "./turnstile-field";

export interface TurnstileWidgetHandle {
  reset(): void;
}

interface TurnstileWidgetProps {
  siteKey: string;
  action: HumanAction;
  onTokenChange?: (token: string | null) => void;
}

/** Visible widget for forms. Turnstile adds a hidden `cf-turnstile-response` input to the form. */
export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ siteKey, action, onTokenChange }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<{ api: TurnstileApi; id: string } | null>(null);
    const onTokenChangeRef = useRef(onTokenChange);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
      onTokenChangeRef.current = onTokenChange;
    }, [onTokenChange]);

    useImperativeHandle(ref, () => ({
      reset() {
        if (widgetRef.current) widgetRef.current.api.reset(widgetRef.current.id);
        onTokenChangeRef.current?.(null);
      },
    }));

    useEffect(() => {
      let cancelled = false;
      loadTurnstile()
        .then((api) => {
          if (cancelled || !containerRef.current) return;
          const id = api.render(containerRef.current, {
            sitekey: siteKey,
            action,
            theme: "dark",
            language: "es",
            callback: (token) => onTokenChangeRef.current?.(token),
            "expired-callback": () => onTokenChangeRef.current?.(null),
            "error-callback": () => onTokenChangeRef.current?.(null),
          });
          widgetRef.current = { api, id };
        })
        .catch(() => setLoadError(true));
      return () => {
        cancelled = true;
        if (widgetRef.current) widgetRef.current.api.remove(widgetRef.current.id);
        widgetRef.current = null;
      };
    }, [siteKey, action]);

    return (
      <div>
        <div ref={containerRef} className="min-h-[65px]" />
        {loadError && (
          <p role="alert" className="text-sm text-danger">
            No se pudo cargar la verificación anti-bots. Revisa tu conexión o bloqueador.
          </p>
        )}
      </div>
    );
  },
);
