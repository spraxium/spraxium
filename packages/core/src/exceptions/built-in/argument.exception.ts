import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when the user provides invalid or missing arguments to a prefix command.
 *
 * The exception handler will render a usage/error layout with the following
 * {{placeholder}} variables available:
 * - `{{command}}` — the command name
 * - `{{expected}}` — the expected argument type
 * - `{{received}}` — the raw input received
 * - `{{usage}}` — the full usage string
 * - `{{argument}}` — the argument name
 */
export class ArgumentException extends SpraxiumException {
  constructor(props?: Record<string, unknown>) {
    super({
      code: 'INVALID_ARGUMENT',
      message: 'Invalid argument {{argument}}: expected {{expected}}, received "{{received}}".',
      props: props ?? {},
      shouldReply: true,
      shouldLog: false,
    });
  }
}
