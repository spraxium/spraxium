/** Abstraction for user/guild locale preference storage. */
export interface I18nStore {
  /** Initialize the store , called once at boot. */
  init(): Promise<void>;
  /** Retrieve the stored locale for a user, or undefined if not set. */
  getUser(userId: string): Promise<string | undefined>;
  /** Persist the locale preference for a user. */
  setUser(userId: string, locale: string): Promise<void>;
  /** Retrieve the stored locale for a guild, or undefined if not set. */
  getGuild(guildId: string): Promise<string | undefined>;
  /** Persist the locale preference for a guild. */
  setGuild(guildId: string, locale: string): Promise<void>;
}
