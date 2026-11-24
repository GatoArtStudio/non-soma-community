import { NextResponse, type NextRequest } from "next/server";
import { getHandleKickWebhook } from "@/kick-events/container";

const MAX_BODY_BYTES = 64 * 1024;

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  const header = (name: string) => request.headers.get(name) ?? "";
  try {
    const outcome = await getHandleKickWebhook()({
      rawBody,
      headers: {
        messageId: header("kick-event-message-id"),
        timestamp: header("kick-event-message-timestamp"),
        signature: header("kick-event-signature"),
        eventType: header("kick-event-type"),
        eventVersion: header("kick-event-version"),
      },
    });
    console.info(
      "[kick-webhook]",
      JSON.stringify({
        event: header("kick-event-type"),
        version: header("kick-event-version"),
        messageId: header("kick-event-message-id"),
        ...outcome,
      }),
    );
    if (outcome.status === "rejected") {
      return NextResponse.json(
        { error: outcome.reason },
        { status: outcome.reason === "bad_signature" ? 401 : 400 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Kick webhook processing failed", error);
    return new NextResponse(null, { status: 500 });
  }
}
