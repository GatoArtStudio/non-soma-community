import "server-only";
import { z } from "zod";
import { generateToken } from "@/shared/crypto/tokens";
import type {
  HumanVerificationRequest,
  HumanVerifier,
} from "@/bot-protection/domain/human-verifier.port";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_AGE_MS = 5 * 60 * 1000;

const siteverifyResponseSchema = z.object({
  success: z.boolean(),
  action: z.string().optional(),
  hostname: z.string().optional(),
  challenge_ts: z.string().optional(),
  "error-codes": z.array(z.string()).optional(),
});

export class TurnstileVerifier implements HumanVerifier {
  constructor(
    private readonly secretKey: string,
    private readonly expectedHostname: string,
  ) {}

  async verify({ token, action, remoteIp }: HumanVerificationRequest): Promise<boolean> {
    if (token.length > 2048) return false;

    const body = new URLSearchParams({
      secret: this.secretKey,
      response: token,
      idempotency_key: generateToken(16),
    });
    if (remoteIp) body.set("remoteip", remoteIp);

    let response: Response;
    try {
      response = await fetch(SITEVERIFY_URL, {
        method: "POST",
        body,
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      return false;
    }
    if (!response.ok) return false;

    const parsed = siteverifyResponseSchema.safeParse(await response.json());
    if (!parsed.success || !parsed.data.success) return false;

    const result = parsed.data;
    // Cloudflare test keys report no action and the hostname "example.com", so these checks
    // only apply when the deployment configures them.
    if (this.expectedHostname) {
      if (result.hostname !== this.expectedHostname) return false;
      if (result.action !== action) return false;
    }
    if (result.challenge_ts) {
      const age = Date.now() - Date.parse(result.challenge_ts);
      if (Number.isNaN(age) || age > MAX_TOKEN_AGE_MS) return false;
    }
    return true;
  }
}
