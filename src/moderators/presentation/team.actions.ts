"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { errorState } from "@/shared/errors/error-messages";
import type { ActionState } from "@/shared/ui/action-state";
import { getChatSubscription } from "@/kick-events/container";
import { getManageTeam } from "@/moderators/container";
import { requireActor } from "./staff-access";

const kickUserIdSchema = z.coerce.number().int().positive();

export async function grantModeratorAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const moderator = await getManageTeam().grantModerator(
      await requireActor(),
      String(formData.get("username") ?? "").slice(0, 40),
    );
    refresh();
    return { status: "success", message: `@${moderator.username} ahora es moderador.` };
  } catch (error) {
    return errorState(error);
  }
}

export async function revokeModeratorAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await getManageTeam().revokeModerator(
      await requireActor(),
      kickUserIdSchema.parse(formData.get("kickUserId")),
    );
    refresh();
    return { status: "success", message: "Acceso retirado." };
  } catch (error) {
    return errorState(error);
  }
}

export async function restoreModeratorAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await getManageTeam().restoreModerator(
      await requireActor(),
      kickUserIdSchema.parse(formData.get("kickUserId")),
    );
    refresh();
    return { status: "success", message: "Acceso restaurado." };
  } catch (error) {
    return errorState(error);
  }
}

export async function ensureChatSubscriptionAction(): Promise<ActionState> {
  try {
    const outcome = await getChatSubscription().ensureChatSubscription(await requireActor());
    refresh();
    return {
      status: "success",
      message:
        outcome === "created"
          ? "Suscripción creada. Los moderadores se detectarán al escribir en el chat."
          : "La suscripción ya estaba activa.",
    };
  } catch (error) {
    return errorState(error);
  }
}
