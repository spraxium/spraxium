import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown for unexpected internal errors.
 *
 * Replies with a generic user-facing message to avoid leaking implementation
 * details. The original error cause is always logged via the framework logger.
 *
 * Available props in layout templates:
 * - `{{cause}}` , the raw error message (NOT shown to users by default layout)
 *
 * @example
 * try {
 *   await someRiskyOperation();
 * } catch (err) {
 *   throw new InternalException({ cause: err instanceof Error ? err.message : String(err) });
 * }
 */
export class InternalException extends SpraxiumException {
  constructor(props?: { cause?: string } & Record<string, unknown>) {
    super({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      props: props ?? {},
      shouldLog: true,
    });
  }
}
