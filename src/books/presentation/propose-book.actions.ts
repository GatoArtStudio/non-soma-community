"use server";

import { refresh } from "next/cache";
import { errorState } from "@/shared/errors/error-messages";
import type { ActionState } from "@/shared/ui/action-state";
import { getActor } from "@/authentication/presentation/viewer";
import {
  getClientIp,
  getOrCreateVisitorHash,
} from "@/bot-protection/presentation/request-fingerprint";
import { TURNSTILE_FIELD } from "@/bot-protection/presentation/turnstile-field";
import { getProposeBook } from "@/books/container";
import { requireCookieConsent } from "@/cookie-consent/presentation/consent-server";
import { bookStatusLabel } from "./book-status-label";

const HONEYPOT_FIELD = "website";

export async function proposeBookAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Bots that fill every field get a fake success and nothing is stored.
  if (String(formData.get(HONEYPOT_FIELD) ?? "") !== "") {
    return { status: "success", message: "¡Gracias! Tu propuesta quedó pendiente de revisión." };
  }

  try {
    await requireCookieConsent();
    const actor = await getActor();
    const result = await getProposeBook()({
      workKey: String(formData.get("workKey") ?? ""),
      verificationToken: String(formData.get(TURNSTILE_FIELD) ?? ""),
      proposer: actor ? { userId: actor.userId, role: actor.role } : null,
      visitorHash: actor ? null : await getOrCreateVisitorHash(),
      remoteIp: await getClientIp(),
    });

    switch (result.outcome) {
      case "proposed":
        return {
          status: "success",
          message: `¡Gracias! «${result.book.title}» quedó pendiente de revisión por los moderadores.`,
        };
      case "published":
        refresh();
        return { status: "success", message: `«${result.book.title}» ya está publicado.` };
      case "already_exists":
        return {
          status: "error",
          message:
            result.book.status === "rejected"
              ? `«${result.book.title}» ya fue revisado y no se aceptó.`
              : `«${result.book.title}» ya está en la plataforma (${bookStatusLabel(result.book.status).toLowerCase()}).`,
        };
    }
  } catch (error) {
    return errorState(error);
  }
}
