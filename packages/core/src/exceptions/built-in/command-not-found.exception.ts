import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when no handler is found for a recognized prefix command.
 * Can be caught by a fallback layout to show a "command not found" message.
 *
 * Available {{placeholder}} variables:
 * - `{{command}}` , the attempted command name
 * - `{{prefix}}` , the prefix that was used
 */
export class CommandNotFoundException extends SpraxiumException {
  constructor(props?: Record<string, unknown>) {
    super({
      code: 'COMMAND_NOT_FOUND',
      message: 'Command "{{command}}" not found.',
      props: props ?? {},
      shouldReply: true,
      shouldLog: false,
    });
  }
}
