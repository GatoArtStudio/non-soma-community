import "server-only";
import type { Viewer } from "@/authentication/presentation/viewer";
import { readVisitorHash } from "@/bot-protection/presentation/request-fingerprint";
import { getToggleLike } from "@/book-likes/container";
import type { Liker } from "@/book-likes/domain/liker";

/** Which of the given books the current visitor already liked, without creating cookies. */
export async function findLikedBookIds(viewer: Viewer, bookIds: number[]): Promise<Set<number>> {
  let liker: Liker | null = null;
  if (viewer.user) {
    liker = { kind: "user", userId: viewer.user.id };
  } else {
    const visitorHash = await readVisitorHash();
    if (visitorHash) liker = { kind: "anonymous", visitorHash };
  }
  return getToggleLike().findLikedBookIds(liker, bookIds);
}
