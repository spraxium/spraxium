import { Ctx, PrefixArg, PrefixCommandHandler, UseGuards } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import type { GuildMember, Message } from 'discord.js';
import { ModCommand } from '../commands/mod.command';
import { ModeratorGuard } from '../guards/moderator.guard';

@UseGuards(ModeratorGuard)
@PrefixCommandHandler(ModCommand, { subcommand: 'ban' })
export class ModBanHandler {
  private readonly logger = new Logger(ModBanHandler.name);

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

    this.logger.info(`${message.author.tag} banned ${member.user.tag}: ${reasonText}`);
    await message.reply(`🔨 <@${userId}> has been banned. **Reason:** ${reasonText}`);
  }
}
