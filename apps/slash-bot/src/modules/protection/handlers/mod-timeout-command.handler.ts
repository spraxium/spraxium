import {
  Ctx,
  SlashCommandHandler,
  SlashIntegerOption,
  SlashUserOption,
  UseGuards,
  withOptions,
} from '@spraxium/common';
import { GuildOnly, PermissionGuard } from '@spraxium/core';
import type { ChatInputCommandInteraction, GuildMember, User } from 'discord.js';
import { ModCommand } from '../commands/mod.command';

@UseGuards(GuildOnly, withOptions(PermissionGuard, { permissions: ['ModerateMembers'] }))
@SlashCommandHandler(ModCommand, { sub: 'timeout' })
export class ModTimeoutHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashUserOption('target') target: User,
    @SlashIntegerOption('duration') duration: number,
  ): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: '❌ Guild not found.', flags: 'Ephemeral' });
      return;
    }

    const member = (await interaction.guild.members.fetch(target.id).catch(() => null)) as GuildMember | null;
    if (!member) {
      await interaction.reply({ content: `❌ Could not find ${target} in this server.`, flags: 'Ephemeral' });
      return;
    }

    await member.timeout(duration * 60 * 1_000, 'Timed out via /mod timeout');
    await interaction.reply(`🔇 **${target.displayName}** timed out for **${duration} minute(s)**.`);
  }
}
