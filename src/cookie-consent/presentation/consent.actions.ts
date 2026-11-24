"use server";

import { deleteVisitorCookie } from "@/bot-protection/presentation/request-fingerprint";

/** Called when the visitor rejects cookies: the device cookie is httpOnly, so the server drops it. */
export async function forgetDeviceAction(): Promise<void> {
  await deleteVisitorCookie();
}
