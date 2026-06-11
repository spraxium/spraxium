/**
 * Represents an expected, user-facing error.
 *
 * These errors carry a message that is safe to print directly to the user
 * without a stack trace (e.g. "schematic not found", "invalid output path").
 * Unexpected errors should be thrown as regular `Error` instances so they are
 * surfaced differently by the command runner.
 */
export class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CliError';
  }
}

export function isCliError(error: unknown): error is CliError {
  return error instanceof CliError;
}
