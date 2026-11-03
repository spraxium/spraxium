export type SpraxiumStartupErrorCode = 'ALREADY_LISTENING' | 'NO_TOKEN' | 'LOGIN_FAILED' | 'READY_TIMEOUT';

/**
 * Raised by `SpraxiumApplication.listen()` when startup cannot complete.
 *
 * Failures that would otherwise terminate the process (missing token, rejected
 * login, repeated `listen()`) are only thrown when `exitOnStartupFailure` is
 * `false`; a READY timeout always rejects with this error. The original
 * failure, such as the discord.js login rejection, is kept as `cause`.
 */
export class SpraxiumStartupError extends Error {
  public readonly code: SpraxiumStartupErrorCode;

  public constructor(code: SpraxiumStartupErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'SpraxiumStartupError';
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
