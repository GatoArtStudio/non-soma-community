/**
 * Errors raised by domain rules and use cases. `code` is stable and mapped to
 * user-facing messages in the presentation layer.
 */
export class DomainError<TCode extends string = string> extends Error {
  constructor(
    readonly code: TCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "DomainError";
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
