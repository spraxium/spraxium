import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { BUTTON_STYLE_MAP } from '../constants';
import type { ButtonDef, ButtonEmojiConfig, LinkButtonDef, StaticButtonDef } from '../interfaces';
import type { ButtonStyleName } from '../types';

function resolveEmoji(emoji: ButtonEmojiConfig): { id?: string; name?: string; animated?: boolean } {
  return typeof emoji === 'string' ? { name: emoji } : emoji;
}

function buildButton(def: ButtonDef): ButtonBuilder {
  const btn = new ButtonBuilder().setLabel(def.label);

  if (def.emoji) btn.setEmoji(resolveEmoji(def.emoji));
  if (def.disabled) btn.setDisabled(def.disabled);

  switch (def.type) {
    case 'link':
      btn.setStyle(ButtonStyle.Link).setURL(def.url);
      break;
    case 'static':
      btn.setStyle(BUTTON_STYLE_MAP[def.style]).setCustomId(def.customId);
      break;
  }

  return btn;
}

function makeStatic(style: ButtonStyleName, customId: string, label: string): StaticButtonDef {
  return { type: 'static', customId, label, style };
}

export const Buttons = {
  primary(customId: string, label: string): StaticButtonDef {
    return makeStatic('primary', customId, label);
  },

  secondary(customId: string, label: string): StaticButtonDef {
    return makeStatic('secondary', customId, label);
  },

  success(customId: string, label: string): StaticButtonDef {
    return makeStatic('success', customId, label);
  },

  danger(customId: string, label: string): StaticButtonDef {
    return makeStatic('danger', customId, label);
  },

  link(url: string, label: string): LinkButtonDef {
    return { type: 'link', url, label };
  },

  emoji<T extends ButtonDef>(def: T, emoji: ButtonEmojiConfig): T {
    return { ...def, emoji };
  },

  disabled<T extends ButtonDef>(def: T): T {
    return { ...def, disabled: true };
  },

  row(items: Array<ButtonDef | null | undefined | false>): ActionRowBuilder<ButtonBuilder> {
    const filtered = items.filter((item): item is ButtonDef => Boolean(item));
    if (filtered.length > 5) throw new Error('[Buttons] Discord limits action rows to 5 buttons.');
    return new ActionRowBuilder<ButtonBuilder>().addComponents(filtered.map(buildButton));
  },

  when<T extends ButtonDef>(condition: unknown, button: T): T | null {
    return condition ? button : null;
  },

  whenElse<A extends ButtonDef, B extends ButtonDef>(condition: unknown, a: A, b: B): A | B {
    return condition ? a : b;
  },
};
