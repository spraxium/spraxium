import { Ctx, SlashAutocompleteHandler, SlashFocused } from '@spraxium/common';
import type { AutocompleteInteraction } from 'discord.js';
import { PingCommand } from '../commands/ping.command';

const SERVICES = [
  { name: 'Gateway', value: 'gateway' },
  { name: 'REST API', value: 'rest-api' },
  { name: 'Voice', value: 'voice' },
  { name: 'CDN', value: 'cdn' },
  { name: 'Database', value: 'database' },
];

@SlashAutocompleteHandler(PingCommand, 'service')
export class PingServiceAutocomplete {
  async handle(
    @SlashFocused() focused: string,
    @Ctx() interaction: AutocompleteInteraction,
  ): Promise<void> {
    const filtered = SERVICES.filter((s) =>
      s.name.toLowerCase().includes(String(focused).toLowerCase()),
    );
    await interaction.respond(filtered.slice(0, 25));
  }
}
