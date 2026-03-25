import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when a command is used in a server but requires a DM context.
 *
 * Used by the built-in `DMOnly` guard and can be thrown manually.
 *
 * @example
 * throw new DMOnlyException();
 */
export class DMOnlyException extends SpraxiumException {
  constructor(props?: Record<string, unknown>) {
    super({
      code: 'DM_ONLY',
      message: 'This command can only be used in a direct message.',
      props: props ?? {},
    });
  }
}
