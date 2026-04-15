import type { SlashI18nKeys } from '@spraxium/common';
import type { LocaleString } from 'discord.js';
import { DISCORD_LOCALES } from '../constants/discord-locales.constant';
import type { SlashLocalizations } from '../interfaces/slash-localizations.interface';
import { LocaleRegistry } from '../registry/locale-registry';

/**
 * Generates `name_localizations` and `description_localizations` from explicit i18n keys.
 *
 * Given `{ name: 'commands.ping.name', description: 'commands.ping.description' }`,
 * looks up each key directly in every registered Discord locale.
 *
 * Only includes locales that Discord supports and that are registered.
 *
 * @example
 * ```ts
 * const locs = buildSlashLocalizations({ name: 'commands.ping.name', description: 'commands.ping.description' });
 * // { name_localizations: { 'pt-BR': 'ping', ... }, description_localizations: { ... } }
 * ```
 */
export function buildSlashLocalizations(keys: SlashI18nKeys): SlashLocalizations {
  const nameLocalizations: Partial<Record<LocaleString, string>> = {};
  const descriptionLocalizations: Partial<Record<LocaleString, string>> = {};
  const defaultLocale = LocaleRegistry.getDefault();

  for (const locale of DISCORD_LOCALES) {
    if (locale === defaultLocale) continue;
    if (!LocaleRegistry.has(locale)) continue;

    const map = LocaleRegistry.get(locale);
    const name = map.get(keys.name);
    const description = map.get(keys.description);

    if (name) nameLocalizations[locale] = name;
    if (description) descriptionLocalizations[locale] = description;
  }

  return {
    name_localizations: nameLocalizations,
    description_localizations: descriptionLocalizations,
  };
}

/**
 * Generates localizations for a slash command option.
 *
 * Given `{ name: 'commands.ping.options.target.name', description: 'commands.ping.options.target.description' }`,
 * looks up each key directly per locale.
 */
export function buildOptionLocalizations(keys: SlashI18nKeys): SlashLocalizations {
  return buildSlashLocalizations(keys);
}

/**
 * Generates name localizations for a choice value.
 *
 * Given `commands.lang.options.locale.choices.english`, looks up
 * that key in each locale.
 */
export function buildChoiceLocalizations(i18nKey: string): Partial<Record<LocaleString, string>> {
  const localizations: Partial<Record<LocaleString, string>> = {};
  const defaultLocale = LocaleRegistry.getDefault();

  for (const locale of DISCORD_LOCALES) {
    if (locale === defaultLocale) continue;
    if (!LocaleRegistry.has(locale)) continue;

    const map = LocaleRegistry.get(locale);
    const value = map.get(i18nKey);
    if (value) localizations[locale] = value;
  }

  return localizations;
}
