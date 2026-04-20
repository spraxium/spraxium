import { Ctx, SlashCommandHandler, SlashOpt, UseGuards } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import type { ChatInputCommandInteraction, GuildMember, User } from 'discord.js';
import { ModeratorGuard } from '../../prefix/guards/moderator.guard';
import { BanCommand } from '../commands/ban.command';

@UseGuards(ModeratorGuard)
@SlashCommandHandler(BanCommand)
export class BanHandler {
  private readonly logger = new Logger(BanHandler.name);

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('target') target: User,
    @SlashOpt('reason') reason: string | null,
    @SlashOpt('days') days: number | null,
  ): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: '❌ This command can only be used in a server.', flags: 'Ephemeral' });
      return;
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null) as GuildMember | null;
    if (!member) {
      await interaction.reply({ content: `❌ Could not find member ${target}.`, flags: 'Ephemeral' });
      return;
    }

    const reasonText = reason ?? 'No reason provided';
    const deleteSeconds = (days ?? 0) * 86_400;

    this.logger.info(`${interaction.user.tag} banned ${target.tag}: ${reasonText} (delete ${days ?? 0}d)`);
    await interaction.reply(
      `🔨 ${target} has been banned.\n**Reason:** ${reasonText}${deleteSeconds > 0 ? `\n**Messages deleted:** last ${days} day(s)` : ''}`,
    );
  }
}
