/** Who is liking a book: a Kick account, or an anonymous browser on a given network. */
export type Liker =
  | { kind: "user"; userId: number }
  | { kind: "anonymous"; visitorHash: string; networkHash: string };

export function likerKey(liker: Liker): string {
  return liker.kind === "user" ? `user:${liker.userId}` : `anon:${liker.visitorHash}`;
}

/** Anonymous likes are also unique per network, so clearing cookies does not grant new likes. */
export function networkKey(liker: Liker): string | null {
  return liker.kind === "anonymous" ? `net:${liker.networkHash}` : null;
}
