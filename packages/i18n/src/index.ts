export { I18nModule } from './i18n.module';
export { I18nLifecycle } from './i18n.lifecycle';
export { defineI18n } from './i18n.config';
export { I18nService } from './service';
export { LocaleRegistry } from './registry';
export { LocaleInterpolator, LocaleResolver, PluralResolver } from './resolvers';
export { ReferenceLoader } from './loaders';
export { MemoryStore, I18nStoreRegistry } from './stores';
export {
  buildChoiceLocalizations,
  buildOptionLocalizations,
  buildSlashLocalizations,
  defineTranslations,
  LocalizedEmbedBuilder,
} from './helpers';
export type { I18nConfig, I18nReference } from './interfaces';
export type { I18nStore } from './interfaces';
export type { LocalizedField } from './interfaces';
export type { SlashLocalizations } from './interfaces';
export type { InterpolationVars } from './types';
export type { LocaleData } from './types';
export type { PluralCategory, PluralRule } from './types';
export { DISCORD_LOCALES, I18N_DEFAULTS } from './constants';
