/** Who is liking a book: a Kick account, or an anonymous device identified by its cookie. */
export type Liker = { kind: "user"; userId: number } | { kind: "anonymous"; visitorHash: string };

export function likerKey(liker: Liker): string {
  return liker.kind === "user" ? `user:${liker.userId}` : `anon:${liker.visitorHash}`;
}
