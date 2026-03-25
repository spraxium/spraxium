import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when a command is used in a DM but requires a guild (server) context.
 *
 * Used by the built-in `GuildOnly` guard and can be thrown manually.
 *
 * @example
 * throw new GuildOnlyException();
 */
export class GuildOnlyException extends SpraxiumException {
  constructor(props?: Record<string, unknown>) {
    super({
      code: 'GUILD_ONLY',
      message: 'This command can only be used inside a server.',
      props: props ?? {},
    });
  }
}
