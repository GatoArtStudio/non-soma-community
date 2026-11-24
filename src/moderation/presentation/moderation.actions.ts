"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { errorState } from "@/shared/errors/error-messages";
import type { ActionState } from "@/shared/ui/action-state";
import { requireActor } from "@/moderators/presentation/staff-access";
import { getReviewBooks } from "@/moderation/container";
import { getManageReading } from "@/readings/container";

const bookIdSchema = z.coerce.number().int().positive();

function readBookId(formData: FormData): number {
  return bookIdSchema.parse(formData.get("bookId"));
}

function readText(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").slice(0, 300);
}

async function run(work: () => Promise<void>, successMessage: string): Promise<ActionState> {
  try {
    await work();
    refresh();
    return { status: "success", message: successMessage };
  } catch (error) {
    return errorState(error);
  }
}

export async function approveBookAction(_: ActionState, formData: FormData) {
  return run(
    async () => getReviewBooks().approveBook(await requireActor(), readBookId(formData)),
    "Libro aprobado.",
  );
}

export async function rejectBookAction(_: ActionState, formData: FormData) {
  return run(
    async () =>
      getReviewBooks().rejectBook(
        await requireActor(),
        readBookId(formData),
        readText(formData, "reason"),
      ),
    "Propuesta rechazada.",
  );
}

export async function restoreBookAction(_: ActionState, formData: FormData) {
  return run(
    async () => getReviewBooks().restoreBook(await requireActor(), readBookId(formData)),
    "Libro publicado.",
  );
}

export async function deleteBookAction(_: ActionState, formData: FormData) {
  return run(
    async () =>
      getReviewBooks().deleteBook(
        await requireActor(),
        readBookId(formData),
        readText(formData, "reason"),
      ),
    "Libro eliminado.",
  );
}

export async function markBookReadAction(_: ActionState, formData: FormData) {
  return run(
    async () => getReviewBooks().markBookRead(await requireActor(), readBookId(formData)),
    "Marcado como leído.",
  );
}

export async function markBookUnreadAction(_: ActionState, formData: FormData) {
  return run(
    async () => getReviewBooks().markBookUnread(await requireActor(), readBookId(formData)),
    "Devuelto a recomendados.",
  );
}

export async function startReadingAction(_: ActionState, formData: FormData) {
  return run(
    async () =>
      getManageReading().startReading(
        await requireActor(),
        readBookId(formData),
        readText(formData, "chapter"),
      ),
    "Lectura iniciada.",
  );
}

export async function updateChapterAction(_: ActionState, formData: FormData) {
  return run(
    async () =>
      getManageReading().updateChapter(await requireActor(), readText(formData, "chapter")),
    "Capítulo actualizado.",
  );
}

export async function finishReadingAction() {
  return run(
    async () => getManageReading().finishReading(await requireActor()),
    "Lectura terminada. El libro pasó a «Leídos».",
  );
}

export async function cancelReadingAction() {
  return run(
    async () => getManageReading().cancelReading(await requireActor()),
    "Lectura cancelada.",
  );
}
