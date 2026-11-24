"use server";

import { z } from "zod";
import { messageForError } from "@/shared/errors/error-messages";
import { isDomainError } from "@/shared/errors/domain-error";
import { getActor } from "@/authentication/presentation/viewer";
import {
  getOrCreateVisitorHash,
  getRequestFingerprint,
} from "@/bot-protection/presentation/request-fingerprint";
import { getToggleLike } from "@/book-likes/container";
import type { Liker } from "@/book-likes/domain/liker";

const toggleLikeSchema = z.object({
  bookId: z.number().int().positive(),
  like: z.boolean(),
  verificationToken: z.string().max(2048),
});

export type ToggleLikeActionResult =
  { ok: true; liked: boolean; likesCount: number } | { ok: false; message: string };

export async function toggleLikeAction(input: unknown): Promise<ToggleLikeActionResult> {
  const parsed = toggleLikeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: messageForError(null) };

  try {
    const fingerprint = await getRequestFingerprint();
    const actor = await getActor();
    const liker: Liker = actor
      ? { kind: "user", userId: actor.userId }
      : {
          kind: "anonymous",
          visitorHash: await getOrCreateVisitorHash(),
          networkHash: fingerprint.networkHash,
        };

    const result = await getToggleLike().toggleLike({
      ...parsed.data,
      liker,
      remoteIp: fingerprint.remoteIp,
      networkHash: fingerprint.networkHash,
    });
    return { ok: true, ...result };
  } catch (error) {
    if (!isDomainError(error)) console.error(error);
    return { ok: false, message: messageForError(error) };
  }
}
