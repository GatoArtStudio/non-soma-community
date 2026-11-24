"use client";

import { useState, useTransition } from "react";
import { useInvisibleTurnstile } from "@/bot-protection/presentation/use-invisible-turnstile";
import { saveConsent, useCookieConsent } from "@/cookie-consent/presentation/use-cookie-consent";
import { cn } from "@/shared/ui/cn";
import { HeartIcon } from "@/shared/ui/icons";
import { toggleLikeAction } from "./like.actions";

interface LikeButtonProps {
  bookId: number;
  bookTitle: string;
  initialLiked: boolean;
  initialCount: number;
  turnstileSiteKey: string;
  size?: "sm" | "lg";
}

export function LikeButton({
  bookId,
  bookTitle,
  initialLiked,
  initialCount,
  turnstileSiteKey,
  size = "sm",
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);
  const [askingConsent, setAskingConsent] = useState(false);
  const consent = useCookieConsent();
  const [pending, startTransition] = useTransition();
  const { containerRef, getToken } = useInvisibleTurnstile(turnstileSiteKey, "like_book");

  function handleClick() {
    if (consent !== "accepted") {
      setAskingConsent(true);
      return;
    }
    toggle();
  }

  function acceptAndVote() {
    saveConsent("accepted");
    setAskingConsent(false);
    toggle();
  }

  function toggle() {
    setError(null);
    startTransition(async () => {
      let verificationToken: string;
      try {
        verificationToken = await getToken();
      } catch {
        setError("No pudimos verificar que eres humano.");
        return;
      }
      const result = await toggleLikeAction({ bookId, like: !liked, verificationToken });
      if (result.ok) {
        setLiked(result.liked);
        setCount(result.likesCount);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={liked}
        aria-label={`Me gusta: ${bookTitle}, ${count} ${count === 1 ? "voto" : "votos"}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border pointer-coarse:min-h-11",
          "transition-[color,background-color,border-color,scale] duration-150 ease-(--ease-out) active:scale-[0.95]",
          size === "lg" ? "min-h-10 px-4 text-base" : "min-h-8 px-3 text-sm",
          liked
            ? "border-paper bg-paper text-ink-950"
            : "border-ink-600 text-ink-200 hover:border-ink-300 hover:text-paper",
          pending && "opacity-60",
        )}
      >
        <HeartIcon filled={liked} className={size === "lg" ? "size-5" : "size-4"} />
        <span className="tabular-nums">{new Intl.NumberFormat("es-CO").format(count)}</span>
      </button>
      <div ref={containerRef} />
      {askingConsent && consent !== "accepted" && (
        <div
          role="status"
          className="flex max-w-56 flex-col items-start gap-1.5 text-xs text-ink-300"
        >
          <p>Para votar necesitas aceptar las cookies.</p>
          <button
            type="button"
            onClick={acceptAndVote}
            className="rounded-full border border-ink-600 px-3 py-1 text-ink-200 transition-colors duration-150 hover:border-ink-300 hover:text-paper pointer-coarse:min-h-11"
          >
            Aceptar y votar
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="max-w-48 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
