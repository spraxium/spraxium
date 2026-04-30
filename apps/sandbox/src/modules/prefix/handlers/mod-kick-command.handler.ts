import { Ctx, PrefixArg, PrefixCommandHandler, UseGuards } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import type { GuildMember, Message } from 'discord.js';
import { ModCommand } from '../commands/mod.command';
import { ModeratorGuard } from '../guards/moderator.guard';

@UseGuards(ModeratorGuard)
@PrefixCommandHandler(ModCommand, { subcommand: 'kick' })
export class ModKickHandler {
  private readonly logger = new Logger(ModKickHandler.name);

  async handle(
    @Ctx() message: Message,
    @PrefixArg('target') userId: string,
    @PrefixArg('reason') reason: string | undefined,
  ): Promise<void> {
    if (!message.guild) {
      await message.reply('This command can only be used in a server.');
      return;
    }

    const reasonText = reason ?? 'No reason provided';

    const member = (await message.guild.members.fetch(userId).catch(() => null)) as GuildMember | null;
    if (!member) {
      await message.reply(`❌ Could not find member <@${userId}>.`);
      return;
    }

    this.logger.info(`${message.author.tag} kicked ${member.user.tag}: ${reasonText}`);
    await message.reply(`👢 <@${userId}> has been kicked. **Reason:** ${reasonText}`);
  }
}
