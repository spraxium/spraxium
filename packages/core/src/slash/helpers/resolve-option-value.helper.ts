import type { SlashOptionType } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';

export function resolveOptionValue(
  interaction: ChatInputCommandInteraction,
  name: string,
  type: SlashOptionType,
): unknown {
  switch (type) {
    case 'STRING':
      return interaction.options.getString(name);
    case 'INTEGER':
      return interaction.options.getInteger(name);
    case 'NUMBER':
      return interaction.options.getNumber(name);
    case 'BOOLEAN':
      return interaction.options.getBoolean(name);
    case 'USER':
      return interaction.options.getUser(name);
    case 'CHANNEL':
      return interaction.options.getChannel(name);
    case 'ROLE':
      return interaction.options.getRole(name);
    case 'MENTIONABLE':
      return interaction.options.getMentionable(name);
    case 'ATTACHMENT':
      return interaction.options.getAttachment(name);
    default:
      return null;
  }
}
