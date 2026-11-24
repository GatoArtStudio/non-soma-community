import { NextResponse, type NextRequest } from "next/server";
import { getKickLogin } from "@/authentication/container";
import {
  consumePendingLogin,
  writeSessionCookie,
} from "@/authentication/presentation/session-cookies";
import { getEnv } from "@/shared/config/env";
import { isDomainError } from "@/shared/errors/domain-error";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const appUrl = getEnv().APP_URL;
  const pending = await consumePendingLogin();

  try {
    const login = await getKickLogin().completeKickLogin({
      code: params.get("code"),
      state: params.get("state"),
      pending,
    });
    await writeSessionCookie(login.sessionToken, login.expiresAt);
    return NextResponse.redirect(new URL(login.returnTo, appUrl));
  } catch (error) {
    if (!isDomainError(error)) console.error(error);
    const code = isDomainError(error) ? error.code : "kick_login_failed";
    return NextResponse.redirect(new URL(`/?login_error=${code}`, appUrl));
  }
}
