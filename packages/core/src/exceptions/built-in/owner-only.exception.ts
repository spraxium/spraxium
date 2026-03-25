import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when a command is restricted to the bot owner(s).
 *
 * Used by the built-in `OwnerOnly` guard and can be thrown manually.
 *
 * @example
 * throw new OwnerOnlyException();
 */
export class OwnerOnlyException extends SpraxiumException {
  constructor(props?: Record<string, unknown>) {
    super({
      code: 'OWNER_ONLY',
      message: 'This command is restricted to the bot owner.',
      props: props ?? {},
    });
  }
}
