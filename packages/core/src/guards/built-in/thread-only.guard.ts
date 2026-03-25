import { Guard } from '@spraxium/common';
import type { ExecutionContext, SpraxiumGuard } from '@spraxium/common';
import { ChannelType } from 'discord.js';

/**
 * Allows the command only when invoked inside a thread channel
 * (public, private, or announcement thread).
 *
 * @example
 *   @UseGuards(ThreadOnlyGuard)
 *   export class ThreadSurveyHandler { ... }
 */
@Guard()
export class ThreadOnlyGuard implements SpraxiumGuard {
  public canActivate(ctx: ExecutionContext): boolean {
    const interaction = ctx.getInteraction();
    const channel = interaction.channel;
    if (!channel) return false;

    return (
      channel.type === ChannelType.PublicThread ||
      channel.type === ChannelType.PrivateThread ||
      channel.type === ChannelType.AnnouncementThread
    );
  }
}
