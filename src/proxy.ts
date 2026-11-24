import { NextResponse, type NextRequest } from "next/server";
import { normalizeNetwork } from "@/bot-protection/domain/network";
import { MemoryRateLimiter } from "@/bot-protection/infrastructure/memory.rate-limiter";
import { resolveClientIp } from "@/bot-protection/presentation/client-ip";

const limiter = new MemoryRateLimiter();
const MINUTE = 60;

/**
 * Per-IP request ceilings, generous because mobile carriers put many people behind one IP.
 * Cloudflare's own rate limiting is the first line; this protects the origin if it is skipped.
 */
function ruleFor(request: NextRequest, network: string) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/auth/kick/login")) {
    return { key: `login:${network}`, limit: 30, windowSeconds: MINUTE };
  }
  if (pathname.startsWith("/api/books/search")) {
    return { key: `search:${network}`, limit: 90, windowSeconds: MINUTE };
  }
  if (request.method === "POST") {
    return { key: `post:${network}`, limit: 180, windowSeconds: MINUTE };
  }
  return { key: `get:${network}`, limit: 900, windowSeconds: MINUTE };
}

export function proxy(request: NextRequest) {
  const ip = resolveClientIp(request.headers, process.env.TRUST_CLOUDFLARE === "true");
  // Without a trusted client IP every visitor would share one counter, so the limit stays off.
  if (!ip) return NextResponse.next();

  if (!limiter.consume(ruleFor(request, normalizeNetwork(ip)))) {
    return new NextResponse("Demasiadas solicitudes. Espera un momento y vuelve a intentarlo.", {
      status: 429,
      headers: { "Retry-After": "60", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand/|api/webhooks|api/health).*)",
  ],
};
