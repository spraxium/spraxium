import type { SlashLocalizationMap } from '../types/slash-localization.type';

/**
 * Resolved name and description localizations for a slash command, subcommand,
 * subcommand group, or option; ready to be passed directly to a discord.js builder's
 * `setNameLocalizations` / `setDescriptionLocalizations` methods.
 */
export interface SlashLocalizationResult {
  name_localizations: SlashLocalizationMap;
  description_localizations: SlashLocalizationMap;
}
