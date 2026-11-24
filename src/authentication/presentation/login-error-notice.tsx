import { messageForCode } from "@/shared/errors/error-messages";

export async function LoginErrorNotice({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const code = (await searchParams).login_error;
  const message = messageForCode(typeof code === "string" ? code : null);
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-danger/40 px-4 py-3 text-sm text-danger">
      {message}
    </p>
  );
}
