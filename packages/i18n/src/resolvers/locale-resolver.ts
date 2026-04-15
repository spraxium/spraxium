import type { I18nStore } from '../interfaces/i18n-store.interface';
import { LocaleRegistry } from '../registry/locale-registry';

/**
 * Resolves the effective locale for a given context.
 * Priority: user preference > guild preference > default.
 */
export class LocaleResolver {
  constructor(private readonly store: I18nStore) {}

  async resolve(userId?: string, guildId?: string): Promise<string> {
    if (userId) {
      const userLocale = await this.store.getUser(userId);
      if (userLocale && LocaleRegistry.has(userLocale)) return userLocale;
    }

    if (guildId) {
      const guildLocale = await this.store.getGuild(guildId);
      if (guildLocale && LocaleRegistry.has(guildLocale)) return guildLocale;
    }

    return LocaleRegistry.getDefault();
  }
}
