export type HumanAction = "propose_book" | "like_book";

export interface HumanVerificationRequest {
  token: string;
  action: HumanAction;
  remoteIp: string | null;
}

export interface HumanVerifier {
  verify(request: HumanVerificationRequest): Promise<boolean>;
}
