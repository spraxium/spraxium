import {
  Ctx,
  SlashCommandHandler,
  SlashStringOption,
  SlashUserOption,
  UseGuards,
  withOptions,
} from '@spraxium/common';
import { CooldownGuard, GuildOnly, PermissionGuard } from '@spraxium/core';
import type { ChatInputCommandInteraction, User } from 'discord.js';
import { ModCommand } from '../commands/mod.command';

@UseGuards(
  GuildOnly,
  withOptions(PermissionGuard, { permissions: ['ManageMessages'] }),
  withOptions(CooldownGuard, { cooldown: 10_000 }),
)
@SlashCommandHandler(ModCommand, { sub: 'warn' })
export class ModWarnHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashUserOption('target') target: User,
    @SlashStringOption('reason') reason: string | null,
  ): Promise<void> {
    const reasonText = reason ?? 'No reason provided';
    await interaction.reply(`⚠️ **${target.displayName}** has been warned.\n**Reason:** ${reasonText}`);
  }
}
