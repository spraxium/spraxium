import { Ctx, SlashCommandHandler, SlashOpt } from '@spraxium/common';
import type { Attachment, ChatInputCommandInteraction, Role, TextChannel, User } from 'discord.js';
import { InspectCommand } from '../commands/inspect.command';

@SlashCommandHandler(InspectCommand)
export class InspectHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('text') text: string,
    @SlashOpt('count') count: number | null,
    @SlashOpt('ratio') ratio: number | null,
    @SlashOpt('flag') flag: boolean | null,
    @SlashOpt('target') target: User | null,
    @SlashOpt('channel') channel: TextChannel | null,
    @SlashOpt('role') role: Role | null,
    @SlashOpt('mention') mention: User | Role | null,
    @SlashOpt('file') file: Attachment | null,
  ): Promise<void> {
    const lines = [
      '📋 **Received option values:**',
      `> **text** *(String)*: ${text}`,
      `> **count** *(Integer)*: ${count ?? '—'}`,
      `> **ratio** *(Number)*: ${ratio ?? '—'}`,
      `> **flag** *(Boolean)*: ${flag ?? '—'}`,
      `> **target** *(User)*: ${target ?? '—'}`,
      `> **channel** *(Channel)*: ${channel ?? '—'}`,
      `> **role** *(Role)*: ${role ?? '—'}`,
      `> **mention** *(Mentionable)*: ${mention ?? '—'}`,
      `> **file** *(Attachment)*: ${file?.name ?? '—'}`,
    ];
    await interaction.reply({ content: lines.join('\n'), flags: 'Ephemeral' });
  }
}
