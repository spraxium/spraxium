import {
  Ctx,
  SlashCommandHandler,
  SlashStringOption,
  SlashUserOption,
  UseGuards,
  withOptions,
} from '@spraxium/common';
import { GuildOnly, PermissionGuard } from '@spraxium/core';
import type { ChatInputCommandInteraction, GuildMember, User } from 'discord.js';
import { ModCommand } from '../commands/mod.command';

@UseGuards(GuildOnly, withOptions(PermissionGuard, { permissions: ['KickMembers'] }))
@SlashCommandHandler(ModCommand, { sub: 'kick' })
export class ModKickHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashUserOption('target') target: User,
    @SlashStringOption('reason') reason: string | null,
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

    const reasonText = reason ?? 'No reason provided';
    await member.kick(reasonText);
    await interaction.reply(`👢 **${target.displayName}** has been kicked.\n**Reason:** ${reasonText}`);
  }
}
