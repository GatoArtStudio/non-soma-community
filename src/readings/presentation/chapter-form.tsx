"use client";

import { useActionState } from "react";
import { updateChapterAction } from "@/moderation/presentation/moderation.actions";
import { idleActionState } from "@/shared/ui/action-state";
import { buttonClasses } from "@/shared/ui/button";
import { cn } from "@/shared/ui/cn";

export function ChapterForm({ currentChapter }: { currentChapter: string | null }) {
  const [state, formAction, pending] = useActionState(updateChapterAction, idleActionState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label htmlFor="chapter" className="text-sm text-ink-300">
        ¿Por qué capítulo van?
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id="chapter"
          name="chapter"
          defaultValue={currentChapter ?? ""}
          maxLength={120}
          placeholder="Ej. Capítulo 7: La peste del insomnio"
          className="min-w-0 flex-1 rounded-full border border-ink-700 bg-ink-950 px-4 py-2 text-sm placeholder:text-ink-500 focus:border-ink-400 focus:outline-none"
        />
        <button type="submit" disabled={pending} className={buttonClasses("secondary")}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {state.status !== "idle" && (
        <p
          role="status"
          className={cn("text-xs", state.status === "success" ? "text-success" : "text-danger")}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
