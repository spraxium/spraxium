import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { BUTTON_STYLE_MAP } from '../constants';
import type { ButtonComponentMeta, ButtonEmojiConfig } from '../interfaces';

export class ButtonRenderer {
  render(meta: ButtonComponentMeta): ButtonBuilder {
    const btn = new ButtonBuilder().setLabel(meta.label);

    if (meta.emoji) btn.setEmoji(this.resolveEmoji(meta.emoji));
    if (meta.disabled !== undefined) btn.setDisabled(meta.disabled);

    if (meta.isLink) {
      btn.setStyle(ButtonStyle.Link).setURL(meta.url);
    } else {
      btn.setStyle(BUTTON_STYLE_MAP[meta.style ?? 'primary']).setCustomId(meta.customId);
    }

    return btn;
  }

  private resolveEmoji(emoji: ButtonEmojiConfig): { id?: string; name?: string; animated?: boolean } {
    return typeof emoji === 'string' ? { name: emoji } : emoji;
  }
}
