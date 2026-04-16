import type { LocaleString } from 'discord.js';

/**
 * Mapped type for a Discord localization object.
 * Each key is a Discord-supported locale string; values are the translated text.
 */
export type SlashLocalizationMap = Partial<Record<LocaleString, string>>;
