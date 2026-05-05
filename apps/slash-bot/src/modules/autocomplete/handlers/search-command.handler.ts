import { Ctx, SlashCommandHandler, SlashIntegerOption, SlashStringOption } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { SearchCommand } from '../commands/search.command';

@SlashCommandHandler(SearchCommand)
export class SearchHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashStringOption('query') query: string,
    @SlashIntegerOption('limit') limit: number | null,
  ): Promise<void> {
    const max = limit ?? 10;
    await interaction.reply({
      content: `🔍 Searching **"${query}"** — returning up to ${max} result(s)…`,
      flags: 'Ephemeral',
    });
  }
}
