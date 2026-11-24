import { NextResponse, type NextRequest } from "next/server";
import { getSearchCatalog } from "@/books/container";
import { messageForError } from "@/shared/errors/error-messages";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  try {
    const results = await getSearchCatalog()(query);
    return NextResponse.json({ results }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: messageForError(error) }, { status: 502 });
  }
}
