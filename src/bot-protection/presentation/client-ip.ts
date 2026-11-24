/**
 * Client IP as seen by the app. Only trustworthy behind Cloudflare, where `CF-Connecting-IP`
 * is set by the edge; otherwise every visitor would share the reverse proxy's address.
 */
export function resolveClientIp(headerList: Headers, trustCloudflare: boolean): string | null {
  if (!trustCloudflare) return null;
  return headerList.get("cf-connecting-ip")?.trim() || null;
}
