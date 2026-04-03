import type { SlashOptionMetadata } from '@spraxium/common';
import type { SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import type { GuildChannelTypeResolvable } from '../types';

export function applyOption(
  builder: SlashCommandBuilder | SlashCommandSubcommandBuilder,
  opt: SlashOptionMetadata,
): void {
  switch (opt.type) {
    case 'STRING':
      builder.addStringOption((o) => {
        o.setName(opt.name).setDescription(opt.description).setRequired(opt.required);
        if (opt.minLength !== undefined) o.setMinLength(opt.minLength);
        if (opt.maxLength !== undefined) o.setMaxLength(opt.maxLength);
        if (opt.autocomplete) o.setAutocomplete(true);
        if (opt.choices?.length) {
          o.addChoices(...(opt.choices as Array<{ name: string; value: string }>));
        }
        return o;
      });
      break;
    case 'INTEGER':
      builder.addIntegerOption((o) => {
        o.setName(opt.name).setDescription(opt.description).setRequired(opt.required);
        if (opt.min !== undefined) o.setMinValue(opt.min);
        if (opt.max !== undefined) o.setMaxValue(opt.max);
        if (opt.autocomplete) o.setAutocomplete(true);
        if (opt.choices?.length) {
          o.addChoices(...(opt.choices as Array<{ name: string; value: number }>));
        }
        return o;
      });
      break;
    case 'NUMBER':
      builder.addNumberOption((o) => {
        o.setName(opt.name).setDescription(opt.description).setRequired(opt.required);
        if (opt.min !== undefined) o.setMinValue(opt.min);
        if (opt.max !== undefined) o.setMaxValue(opt.max);
        if (opt.autocomplete) o.setAutocomplete(true);
        return o;
      });
      break;
    case 'BOOLEAN':
      builder.addBooleanOption((o) =>
        o.setName(opt.name).setDescription(opt.description).setRequired(opt.required),
      );
      break;
    case 'USER':
      builder.addUserOption((o) =>
        o.setName(opt.name).setDescription(opt.description).setRequired(opt.required),
      );
      break;
    case 'CHANNEL':
      builder.addChannelOption((o) => {
        o.setName(opt.name).setDescription(opt.description).setRequired(opt.required);
        if (opt.channelTypes?.length) {
          o.addChannelTypes(...(opt.channelTypes as unknown as Array<GuildChannelTypeResolvable>));
        }
        return o;
      });
      break;
    case 'ROLE':
      builder.addRoleOption((o) =>
        o.setName(opt.name).setDescription(opt.description).setRequired(opt.required),
      );
      break;
    case 'MENTIONABLE':
      builder.addMentionableOption((o) =>
        o.setName(opt.name).setDescription(opt.description).setRequired(opt.required),
      );
      break;
    case 'ATTACHMENT':
      builder.addAttachmentOption((o) =>
        o.setName(opt.name).setDescription(opt.description).setRequired(opt.required),
      );
      break;
  }
}
