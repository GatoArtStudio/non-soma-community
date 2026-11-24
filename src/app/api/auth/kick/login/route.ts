import { NextResponse, type NextRequest } from "next/server";
import { getKickLogin } from "@/authentication/container";
import { writePendingLogin } from "@/authentication/presentation/session-cookies";

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo");
  const { authorizeUrl, pending } = getKickLogin().startKickLogin(returnTo);
  await writePendingLogin(pending);
  return NextResponse.redirect(authorizeUrl);
}
