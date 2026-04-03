import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  MentionableSelectMenuBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder,
} from 'discord.js';
import type { SelectComponentMeta, SelectEmojiConfig, SelectOptionConfig } from '../interfaces';
import type { AnySelectBuilder } from '../types';

export class SelectRenderer {
  render(meta: SelectComponentMeta, options: Array<SelectOptionConfig>): AnySelectBuilder {
    switch (meta.type) {
      case 'string':
        return this.buildString(meta, options);
      case 'user':
        return this.buildUser(meta);
      case 'role':
        return this.buildRole(meta);
      case 'mentionable':
        return this.buildMentionable(meta);
      case 'channel':
        return this.buildChannel(meta);
    }
  }

  renderRow(
    meta: SelectComponentMeta,
    options: Array<SelectOptionConfig>,
  ): ActionRowBuilder<AnySelectBuilder> {
    return new ActionRowBuilder<AnySelectBuilder>().addComponents(this.render(meta, options));
  }

  private applyBase<T extends AnySelectBuilder>(builder: T, meta: SelectComponentMeta): T {
    builder.setCustomId(meta.customId);
    if (meta.placeholder) builder.setPlaceholder(meta.placeholder);
    if (meta.minValues !== undefined) builder.setMinValues(meta.minValues);
    if (meta.maxValues !== undefined) builder.setMaxValues(meta.maxValues);
    if (meta.disabled !== undefined) builder.setDisabled(meta.disabled);
    return builder;
  }

  private resolveEmoji(emoji: SelectEmojiConfig): { id?: string; name?: string; animated?: boolean } {
    return typeof emoji === 'string' ? { name: emoji } : emoji;
  }

  private buildString(
    meta: SelectComponentMeta,
    options: Array<SelectOptionConfig>,
  ): StringSelectMenuBuilder {
    const select = this.applyBase(new StringSelectMenuBuilder(), meta);
    if (options.length > 0) {
      select.addOptions(
        options.map((o) => {
          const opt = new StringSelectMenuOptionBuilder().setLabel(o.label).setValue(o.value);
          if (o.description) opt.setDescription(o.description);
          if (o.default !== undefined) opt.setDefault(o.default);
          if (o.emoji) opt.setEmoji(this.resolveEmoji(o.emoji));
          return opt;
        }),
      );
    }
    return select;
  }

  private buildUser(meta: SelectComponentMeta): UserSelectMenuBuilder {
    return this.applyBase(new UserSelectMenuBuilder(), meta);
  }

  private buildRole(meta: SelectComponentMeta): RoleSelectMenuBuilder {
    return this.applyBase(new RoleSelectMenuBuilder(), meta);
  }

  private buildMentionable(meta: SelectComponentMeta): MentionableSelectMenuBuilder {
    return this.applyBase(new MentionableSelectMenuBuilder(), meta);
  }

  private buildChannel(meta: SelectComponentMeta): ChannelSelectMenuBuilder {
    const select = this.applyBase(new ChannelSelectMenuBuilder(), meta);
    if (meta.channelTypes && meta.channelTypes.length > 0) {
      // biome-ignore lint/suspicious/noExplicitAny: ChannelType spread requires cast
      select.setChannelTypes(...(meta.channelTypes as Array<any>));
    }
    return select;
  }
}
