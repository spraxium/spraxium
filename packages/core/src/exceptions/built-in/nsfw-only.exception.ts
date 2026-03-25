import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when a command is used in a non-NSFW channel but requires one.
 *
 * Used by the built-in `NSFWGuard` and can be thrown manually.
 *
 * @example
 * throw new NsfwOnlyException();
 */
export class NsfwOnlyException extends SpraxiumException {
  constructor(props?: Record<string, unknown>) {
    super({
      code: 'NSFW_ONLY',
      message: 'This command can only be used in an NSFW channel.',
      props: props ?? {},
    });
  }
}
