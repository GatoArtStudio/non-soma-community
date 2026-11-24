"use client";

import { useActionState } from "react";
import { idleActionState } from "@/shared/ui/action-state";
import { buttonClasses } from "@/shared/ui/button";
import { cn } from "@/shared/ui/cn";
import { grantModeratorAction } from "./team.actions";

export function GrantModeratorForm() {
  const [state, formAction, pending] = useActionState(grantModeratorAction, idleActionState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label htmlFor="moderator-username" className="text-sm text-ink-300">
        Añadir moderador por usuario de Kick
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id="moderator-username"
          name="username"
          required
          maxLength={40}
          placeholder="@usuario"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-full border border-ink-700 bg-ink-950 px-4 py-2 text-sm placeholder:text-ink-500 focus:border-ink-400 focus:outline-none"
        />
        <button type="submit" disabled={pending} className={buttonClasses("primary")}>
          {pending ? "Añadiendo…" : "Añadir"}
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
