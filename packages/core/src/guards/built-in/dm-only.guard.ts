import { Guard } from '@spraxium/common';
import type { ExecutionContext, SpraxiumGuard } from '@spraxium/common';

/**
 * Blocks commands invoked inside a guild (i.e. only allows DMs).
 *
 * @example
 *   @UseGuards(DMOnly)
 *   @SlashCommandHandler(ProfileCommand)
 *   export class ProfileHandler { ... }
 */
@Guard()
export class DMOnly implements SpraxiumGuard {
  public canActivate(ctx: ExecutionContext): boolean {
    return ctx.getGuildId() === null;
  }
}
