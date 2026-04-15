import type { I18nStore } from '../interfaces/i18n-store.interface';

/**
 * In-memory locale preference store.
 * Preferences are lost on restart. Use as default fallback
 * or for testing , users should provide their own store for persistence.
 */
export class MemoryStore implements I18nStore {
  private readonly users = new Map<string, string>();
  private readonly guilds = new Map<string, string>();

  async init(): Promise<void> {}

  async getUser(userId: string): Promise<string | undefined> {
    return this.users.get(userId);
  }

  async setUser(userId: string, locale: string): Promise<void> {
    this.users.set(userId, locale);
  }

  async getGuild(guildId: string): Promise<string | undefined> {
    return this.guilds.get(guildId);
  }

  async setGuild(guildId: string, locale: string): Promise<void> {
    this.guilds.set(guildId, locale);
  }
}
