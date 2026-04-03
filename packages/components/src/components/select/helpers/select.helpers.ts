import type { ActionRowBuilder, ChannelType } from 'discord.js';
import type { SelectDef, SelectEmojiConfig, SelectOptionConfig } from '../interfaces';
import { SelectRenderer } from '../renderer';
import type { AnySelectBuilder, SelectType } from '../types';

const renderer = new SelectRenderer();

function baseSelect(type: SelectType, customId: string): SelectDef {
  return { type, customId, options: [] };
}

export const Selects = {
  string(customId: string): SelectDefBuilder {
    return new SelectDefBuilder(baseSelect('string', customId));
  },

  user(customId: string): SelectDefBuilder {
    return new SelectDefBuilder(baseSelect('user', customId));
  },

  role(customId: string): SelectDefBuilder {
    return new SelectDefBuilder(baseSelect('role', customId));
  },

  mentionable(customId: string): SelectDefBuilder {
    return new SelectDefBuilder(baseSelect('mentionable', customId));
  },

  channel(customId: string): SelectDefBuilder {
    return new SelectDefBuilder(baseSelect('channel', customId));
  },

  row(items: Array<SelectDef | null | undefined | false>): ActionRowBuilder<AnySelectBuilder> {
    const filtered = items.filter((item): item is SelectDef => Boolean(item));
    if (filtered.length !== 1)
      throw new Error('[Selects] Each action row must contain exactly one select menu.');
    const def = filtered[0];
    return renderer.renderRow(def, def.options);
  },

  when<T extends SelectDef>(condition: unknown, select: T): T | null {
    return condition ? select : null;
  },

  option(label: string, value: string, description?: string): SelectOptionConfig {
    return description ? { label, value, description } : { label, value };
  },
};

export class SelectDefBuilder {
  constructor(private readonly def: SelectDef) {}

  placeholder(text: string): this {
    this.def.placeholder = text;
    return this;
  }

  minValues(n: number): this {
    this.def.minValues = n;
    return this;
  }

  maxValues(n: number): this {
    this.def.maxValues = n;
    return this;
  }

  disabled(value = true): this {
    this.def.disabled = value;
    return this;
  }

  channelTypes(...types: Array<ChannelType>): this {
    this.def.channelTypes = types;
    return this;
  }

  option(
    label: string,
    value: string,
    extra?: { description?: string; default?: boolean; emoji?: SelectEmojiConfig },
  ): this {
    this.def.options.push({ label, value, ...extra });
    return this;
  }

  options(items: Array<SelectOptionConfig>): this {
    this.def.options.push(...items);
    return this;
  }

  build(): SelectDef {
    return this.def;
  }

  buildRow(): ActionRowBuilder<AnySelectBuilder> {
    return renderer.renderRow(this.def, this.def.options);
  }
}
