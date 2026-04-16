import { Ctx, SlashCommandHandler, SlashOpt, UseGuards, withOptions } from '@spraxium/common';
import { CooldownGuard, GuildOnly, PermissionGuard } from '@spraxium/core';
import type { ChatInputCommandInteraction, User } from 'discord.js';
import { ModCommand } from '../commands/mod.command';

// Guard stack (outer-to-inner execution order):
//   1. GuildOnly       — blocks DM invocations
//   2. PermissionGuard — runtime check: ManageMessages (belt-and-suspenders with defaultMemberPermissions)
//   3. CooldownGuard   — 10-second per-user rate limit
@UseGuards(
  GuildOnly,
  withOptions(PermissionGuard, { permissions: ['ManageMessages'] }),
  withOptions(CooldownGuard, { cooldown: 10_000 }),
)
@SlashCommandHandler(ModCommand, { sub: 'warn' })
export class ModWarnHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('target') target: User,
    @SlashOpt('reason') reason: string | null,
  ): Promise<void> {
    const reasonText = reason ?? 'No reason provided';
    await interaction.reply(`⚠️ **${target.displayName}** has been warned.\n**Reason:** ${reasonText}`);
  }
}
