import { Guard } from '@spraxium/common';
import type { ExecutionContext, SpraxiumGuard } from '@spraxium/common';

/**
 * Blocks commands invoked in non-NSFW channels.
 *
 * Works for both slash commands (ChatInputCommandInteraction) and prefix
 * commands (Message). Returns false when the channel type does not expose
 * an `nsfw` property (e.g. DM channels).
 *
 * @example
 *   @UseGuards(NSFWGuard)
 *   export class AdultContentHandler { ... }
 */
@Guard()
export class NSFWGuard implements SpraxiumGuard {
  public canActivate(ctx: ExecutionContext): boolean {
    const interaction = ctx.getInteraction();
    const channel = interaction.channel;
    if (!channel || !('nsfw' in channel)) return false;
    return (channel as { nsfw: boolean }).nsfw === true;
  }
}
