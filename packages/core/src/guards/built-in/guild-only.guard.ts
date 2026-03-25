import { Guard } from '@spraxium/common';
import type { ExecutionContext, SpraxiumGuard } from '@spraxium/common';

/**
 * Blocks commands invoked outside of a guild (i.e. in a DM).
 *
 * @example
 *   @UseGuards(GuildOnly)
 *   @SlashCommandHandler(KickCommand)
 *   export class KickHandler { ... }
 */
@Guard()
export class GuildOnly implements SpraxiumGuard {
  public canActivate(ctx: ExecutionContext): boolean {
    return ctx.getGuildId() !== null;
  }
}
