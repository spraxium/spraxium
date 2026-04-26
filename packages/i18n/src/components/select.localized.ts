import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS, SelectRenderer } from '@spraxium/components';
import type {
  AnySelectBuilder,
  SelectComponentMeta,
  SelectI18nKeys,
  SelectOptionConfig,
  SelectOptionI18nKeys,
  SpraxiumContext,
} from '@spraxium/components';
import type { ActionRowBuilder } from 'discord.js';
import { resolveKey } from './utils';

// biome-ignore lint/suspicious/noExplicitAny: generic class constructor
type AnyConstructor = new (...args: Array<any>) => object;

/**
 * Resolves select menu i18n keys for the given locale.
 *
 * @example
 * const overrides = resolveSelectI18n({ placeholder: 'select.placeholder' }, 'pt-BR');
 */
export function resolveSelectI18n(keys: SelectI18nKeys, locale: string): { placeholder?: string } {
  return { placeholder: resolveKey(keys.placeholder, locale) };
}

/**
 * Resolves i18n keys on a single select option, returning a copy with translated
 * `label` and `description` where translations exist.
 *
 * @example
 * const resolved = resolveSelectOptionI18n(option, 'pt-BR');
 */
export function resolveSelectOptionI18n(option: SelectOptionConfig, locale: string): SelectOptionConfig {
  if (!option.i18n) return option;
  return {
    ...option,
    label: resolveKey(option.i18n.label, locale) ?? option.label,
    description: resolveKey(option.i18n.description, locale) ?? option.description,
  };
}

export interface BuildLocalizedSelectOptions {
  /** Class decorated with a select decorator (`@StringSelect`, `@UserSelect`, etc.). */
  selectClass: AnyConstructor;
  /** Discord locale string, e.g. `'pt-BR'`. */
  locale: string;
  /** Runtime data forwarded to `dynamicOptions(data)` when present. */
  data?: unknown;
  /** Optional flow context — appends `~contextId` to the select's `customId`. */
  context?: SpraxiumContext<unknown>;
}

/**
 * Builds a select menu action row with i18n keys resolved for the given locale.
 * Applies translations to the placeholder and to each static option's label/description.
 *
 * @example
 * const row = await buildLocalizedSelect({ selectClass: LanguageSelect, locale });
 *
 * // With dynamic options data:
 * const row = await buildLocalizedSelect({ selectClass: GuildSelect, locale, data: { userId } });
 */
export async function buildLocalizedSelect({
  selectClass: SelectClass,
  locale,
  data,
  context,
}: BuildLocalizedSelectOptions): Promise<ActionRowBuilder<AnySelectBuilder>> {
  const meta = Reflect.getOwnMetadata(COMPONENT_METADATA_KEYS.SELECT_COMPONENT, SelectClass) as
    | SelectComponentMeta
    | undefined;

  if (!meta) {
    throw new Error(`[i18n] ${SelectClass.name} is not decorated with a select decorator.`);
  }

  const metaCopy = { ...meta };

  if (metaCopy.i18n) {
    const placeholderOverride = resolveKey(metaCopy.i18n.placeholder, locale);
    if (placeholderOverride !== undefined) metaCopy.placeholder = placeholderOverride;
  }

  let options: Array<SelectOptionConfig> = [];

  if (metaCopy.dynamicOptions && data !== undefined) {
    options = await metaCopy.dynamicOptions(data);
  } else {
    const staticOptions: Array<SelectOptionConfig> =
      Reflect.getOwnMetadata(COMPONENT_METADATA_KEYS.SELECT_OPTIONS_LIST, SelectClass) ?? [];
    options = staticOptions.map((opt) => resolveSelectOptionI18n(opt, locale));
  }

  if (context) {
    metaCopy.customId = `${metaCopy.customId}~${context.id}`;
  }

  return new SelectRenderer().renderRow(metaCopy, options) as ActionRowBuilder<AnySelectBuilder>;
}

export type { SelectI18nKeys, SelectOptionI18nKeys };
