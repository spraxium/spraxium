import type { LocaleString } from 'discord.js';

export interface SlashLocalizations {
  name_localizations: Partial<Record<LocaleString, string>>;
  description_localizations: Partial<Record<LocaleString, string>>;
}
