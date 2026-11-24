import "server-only";
import { z } from "zod";

const booleanFromString = z
  .enum(["true", "false", ""])
  .default("false")
  .transform((value) => value === "true");

const envSchema = z.object({
  APP_URL: z.url().transform((url) => url.replace(/\/$/, "")),
  DATABASE_URL: z.string().optional(),
  DATABASE_HOST: z.string().optional(),
  DATABASE_PORT: z.coerce.number().int().positive().default(3306),
  DATABASE_USER: z.string().optional(),
  DATABASE_PASSWORD: z.string().optional(),
  DATABASE_NAME: z.string().optional(),
  APP_SECRET: z.string().min(32, "APP_SECRET must be at least 32 characters"),
  KICK_CLIENT_ID: z.string().min(1),
  KICK_CLIENT_SECRET: z.string().min(1),
  KICK_CHANNEL_SLUG: z.string().min(1).default("elmune"),
  TURNSTILE_SITE_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  TURNSTILE_EXPECTED_HOSTNAME: z.string().optional().default(""),
  TRUST_CLOUDFLARE: booleanFromString,
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

export type DatabaseConnection =
  | { uri: string }
  | { host: string; port: number; user: string; password: string; database: string };

/**
 * Docker Compose passes discrete credentials so passwords with URL-reserved characters
 * (such as "/" from base64) work; DATABASE_URL is the fallback for running outside Docker.
 */
export function getDatabaseConnection(env: Env): DatabaseConnection {
  if (env.DATABASE_HOST) {
    if (!env.DATABASE_USER || env.DATABASE_PASSWORD === undefined || !env.DATABASE_NAME) {
      throw new Error("DATABASE_HOST requires DATABASE_USER, DATABASE_PASSWORD and DATABASE_NAME");
    }
    return {
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      user: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      database: env.DATABASE_NAME,
    };
  }
  if (env.DATABASE_URL) return { uri: env.DATABASE_URL };
  throw new Error("Configure DATABASE_HOST (with credentials) or DATABASE_URL");
}

let cachedEnv: Env | undefined;

/** Parsed lazily so `next build` works without runtime secrets. */
export function getEnv(): Env {
  if (!cachedEnv) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
    }
    cachedEnv = parsed.data;
  }
  return cachedEnv;
}

export function isSecureContext(): boolean {
  return getEnv().APP_URL.startsWith("https://");
}
