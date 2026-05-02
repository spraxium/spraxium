import {
  Ctx,
  SlashAttachmentOption,
  SlashBooleanOption,
  SlashChannelOption,
  SlashCommandHandler,
  SlashIntegerOption,
  SlashMentionableOption,
  SlashNumberOption,
  SlashOpt,
  SlashOption,
  SlashRoleOption,
  SlashUserOption,
} from '@spraxium/common';
import type { Attachment, ChatInputCommandInteraction, Role, TextChannel, User } from 'discord.js';
import { InspectCommand } from '../commands/inspect.command';

@SlashCommandHandler(InspectCommand)
export class InspectHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('text') rawText: string, // deprecated
    @SlashOption('text') text: string,
    @SlashIntegerOption('count') count: number | null,
    @SlashNumberOption('ratio') ratio: number | null,
    @SlashBooleanOption('flag') flag: boolean | null,
    @SlashUserOption('target') target: User | null,
    @SlashChannelOption('channel') channel: TextChannel | null,
    @SlashRoleOption('role') role: Role | null,
    @SlashMentionableOption('mention') mention: User | Role | null,
    @SlashAttachmentOption('file') file: Attachment | null,
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
