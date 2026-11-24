"use client";

import { useActionState } from "react";
import type { ActionState } from "./action-state";
import { idleActionState } from "./action-state";
import { buttonClasses, type ButtonVariant } from "./button";

interface ActionFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fields: Record<string, string | number>;
  label: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
  confirmMessage?: string;
  /** Adds a free-text reason input next to the button. */
  withReason?: boolean;
}

export function ActionForm({
  action,
  fields,
  label,
  pendingLabel,
  variant = "secondary",
  confirmMessage,
  withReason,
}: ActionFormProps) {
  const [state, formAction, pending] = useActionState(action, idleActionState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
      }}
      className="flex flex-wrap items-center gap-2"
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {withReason && (
        <input
          name="reason"
          maxLength={300}
          placeholder="Motivo (opcional)"
          aria-label="Motivo"
          className="w-40 rounded-full border border-ink-700 bg-ink-900 px-3 py-1.5 text-sm placeholder:text-ink-500"
        />
      )}
      <button type="submit" disabled={pending} className={buttonClasses(variant, "py-1.5")}>
        {pending ? (pendingLabel ?? "Procesando…") : label}
      </button>
      {state.status === "error" && (
        <p role="alert" className="text-xs text-danger">
          {state.message}
        </p>
      )}
    </form>
  );
}
