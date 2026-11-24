"use client";

import { useState, type ReactNode } from "react";
import { buttonClasses } from "@/shared/ui/button";
import { ExternalLink } from "@/shared/ui/external-link";
import { useCookieConsent } from "./use-cookie-consent";

/**
 * Third-party players set their own cookies, so they load only after consent or an explicit
 * click to load this one player.
 */
export function ConsentEmbed({
  provider,
  url,
  children,
}: {
  provider: string;
  url: string;
  children: ReactNode;
}) {
  const consent = useCookieConsent();
  const [loadedByClick, setLoadedByClick] = useState(false);

  if (consent === "accepted" || loadedByClick) return children;

  return (
    <div className="flex size-full flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="max-w-xs text-sm text-ink-300">
        El reproductor de {provider} usa sus propias cookies. Cárgalo solo si estás de acuerdo.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setLoadedByClick(true)}
          className={buttonClasses("secondary")}
        >
          Cargar reproductor
        </button>
        <ExternalLink href={url} className={buttonClasses("ghost")}>
          Abrir en {provider}
        </ExternalLink>
      </div>
    </div>
  );
}
