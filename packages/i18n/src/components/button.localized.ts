import 'reflect-metadata';
import { ButtonRenderer, COMPONENT_METADATA_KEYS } from '@spraxium/components';
import type { ButtonComponentMeta, SpraxiumContext } from '@spraxium/components';
import { ActionRowBuilder } from 'discord.js';
import type { ButtonBuilder } from 'discord.js';
import { resolveKey } from './utils';

// biome-ignore lint/suspicious/noExplicitAny: generic class constructor
type AnyConstructor = new (...args: Array<any>) => object;

export interface BuildLocalizedButtonOptions {
  /** One button class or an array of up to 5 button classes for a single row. */
  input: AnyConstructor | Array<AnyConstructor>;
  /** Discord locale string, e.g. `'pt-BR'`. */
  locale: string;
  /** Optional flow context — appends `~contextId` to each button's `customId`. */
  context?: SpraxiumContext<unknown>;
}

/**
 * Builds a button action row with all `i18n` keys resolved for the given locale.
 * Accepts one button class or an array (up to 5 — Discord limit).
 * Falls back to the static `label`/`emoji` when a translation key produces no result.
 *
 * @example
 * const row = buildLocalizedButton({ input: ConfirmButton, locale });
 *
 * // Multiple buttons in one row:
 * const row = buildLocalizedButton({ input: [ConfirmButton, CancelButton], locale });
 *
 * // With flow context (appends ~contextId to each customId):
 * const row = buildLocalizedButton({ input: ConfirmButton, locale, context });
 */
export function buildLocalizedButton({
  input,
  locale,
  context,
}: BuildLocalizedButtonOptions): ActionRowBuilder<ButtonBuilder> {
  const classes = Array.isArray(input) ? input : [input];

  if (classes.length === 0) {
    throw new Error('[i18n] buildLocalizedButton() requires at least one button class.');
  }
  if (classes.length > 5) {
    throw new Error('[i18n] Discord limits action rows to 5 buttons.');
  }

  const renderer = new ButtonRenderer();
  const row = new ActionRowBuilder<ButtonBuilder>();

  for (const cls of classes) {
    const meta = Reflect.getOwnMetadata(COMPONENT_METADATA_KEYS.BUTTON_COMPONENT, cls) as
      | ButtonComponentMeta
      | undefined;

    if (!meta) {
      throw new Error(`[i18n] ${cls.name} is not decorated with @Button or @LinkButton.`);
    }

    let resolved = meta;

    if (meta.i18n) {
      const labelOverride = resolveKey(meta.i18n.label, locale);
      const emojiOverride = resolveKey(meta.i18n.emoji, locale);

      resolved = {
        ...meta,
        ...(labelOverride !== undefined && { label: labelOverride }),
        ...(emojiOverride !== undefined && { emoji: emojiOverride }),
      };
    }

    const btn = renderer.render(resolved);

    if (context) {
      const json = btn.toJSON();
      if ('custom_id' in json && json.custom_id) {
        btn.setCustomId(`${json.custom_id}~${context.id}`);
      }
    }

    row.addComponents(btn);
  }

  return row;
}
