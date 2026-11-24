import { NextResponse, type NextRequest } from "next/server";
import { getSessionAccess } from "@/authentication/container";
import {
  clearSessionCookie,
  readSessionToken,
} from "@/authentication/presentation/session-cookies";
import { getEnv } from "@/shared/config/env";

export async function POST(request: NextRequest) {
  const appUrl = getEnv().APP_URL;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(appUrl).origin) {
    return new NextResponse(null, { status: 403 });
  }

  await getSessionAccess().endSession(await readSessionToken());
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/", appUrl), { status: 303 });
}
