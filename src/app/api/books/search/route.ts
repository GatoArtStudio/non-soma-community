import { NextResponse, type NextRequest } from "next/server";
import { getSearchCatalog } from "@/books/container";
import { getRequestFingerprint } from "@/bot-protection/presentation/request-fingerprint";
import { isDomainError } from "@/shared/errors/domain-error";
import { messageForError } from "@/shared/errors/error-messages";

export async function GET(request: NextRequest) {
  const { networkHash } = await getRequestFingerprint();
  try {
    const results = await getSearchCatalog()({
      query: request.nextUrl.searchParams.get("q") ?? "",
      networkHash,
    });
    return NextResponse.json({ results }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (error) {
    if (!isDomainError(error)) console.error(error);
    const status = isDomainError(error) && error.code === "rate_limited" ? 429 : 502;
    return NextResponse.json({ error: messageForError(error) }, { status });
  }
}
