"use client";

import { useState, useTransition } from "react";
import { useInvisibleTurnstile } from "@/bot-protection/presentation/use-invisible-turnstile";
import { cn } from "@/shared/ui/cn";
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
  const [pending, startTransition] = useTransition();
  const { containerRef, getToken } = useInvisibleTurnstile(turnstileSiteKey, "like_book");

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
        onClick={toggle}
        disabled={pending}
        aria-pressed={liked}
        aria-label={liked ? `Quitar me gusta a ${bookTitle}` : `Me gusta ${bookTitle}`}
        className={cn(
          "group inline-flex items-center gap-1.5 rounded-full border transition-colors",
          size === "lg" ? "px-4 py-2 text-base" : "px-3 py-1 text-sm",
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
      {error && (
        <p role="alert" className="max-w-48 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.6 0 5.8 3.6 4.5 7.1-1.8 4.8-9.3 9.4-9.3 9.4Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
