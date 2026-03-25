import { Guard } from '@spraxium/common';
import type { ExecutionContext, SpraxiumGuard } from '@spraxium/common';
import type { GuildMember } from 'discord.js';

/**
 * Requires the invoking member to be connected to a voice channel.
 * Works with all interaction types and Message-based handlers.
 * Always returns false in DMs (no voice channels there).
 *
 * @example
 *   @UseGuards(VoiceChannelGuard)
 *   export class PlayMusicHandler { ... }
 */
@Guard()
export class VoiceChannelGuard implements SpraxiumGuard {
  public canActivate(ctx: ExecutionContext): boolean {
    if (ctx.getGuildId() === null) return false;

    const member = ctx.getMember();

    // APIInteractionGuildMember (REST) does not have .voice; GuildMember (cache) does.
    if (!member || !('voice' in member)) return false;

    return (member as GuildMember).voice.channelId !== null;
  }
}
