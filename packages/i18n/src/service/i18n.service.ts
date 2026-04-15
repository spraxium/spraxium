import { Injectable } from '@spraxium/common';
import type { I18nStore } from '../interfaces/i18n-store.interface';
import { LocaleRegistry } from '../registry/locale-registry';
import { LocaleInterpolator } from '../resolvers/locale-interpolator';
import { LocaleResolver } from '../resolvers/locale-resolver';
import { PluralResolver } from '../resolvers/plural-resolver';
import type { InterpolationVars } from '../types/interpolation-vars.type';

@Injectable()
export class I18nService {
  private resolver: LocaleResolver | null = null;
  private store: I18nStore | null = null;

  /** Called by the lifecycle after the store is initialized. */
  bind(store: I18nStore): void {
    this.store = store;
    this.resolver = new LocaleResolver(store);
  }

  private getStore(): I18nStore {
    if (!this.store) throw new Error('[spraxium/i18n] I18nService used before i18n plugin was initialized');
    return this.store;
  }

  private getResolver(): LocaleResolver {
    if (!this.resolver)
      throw new Error('[spraxium/i18n] I18nService used before i18n plugin was initialized');
    return this.resolver;
  }

  /**
   * Translate `key` for the given `locale` with optional variable substitution.
   * Synchronous, reads from the in-memory flat map.
   */
  t(key: string, locale: string, vars?: InterpolationVars): string {
    const localeMap = LocaleRegistry.get(locale);
    let raw = localeMap.get(key);

    if (raw === undefined && locale !== LocaleRegistry.getDefault()) {
      const defaultMap = LocaleRegistry.get(LocaleRegistry.getDefault());
      raw = defaultMap.get(key);
    }

    if (raw === undefined) return key;
    return vars ? LocaleInterpolator.interpolate(raw, vars) : raw;
  }

  /**
   * Translate with pluralization. Uses `count` to select the correct plural form.
   *
   * @example
   * `tp('items', 'pt-BR', 3)` → uses key `items_other` with `{{count}}` = 3
   */
  tp(key: string, locale: string, count: number, vars?: InterpolationVars): string {
    return PluralResolver.resolve(key, locale, count, vars);
  }

  /**
   * Translate `key` for a user. Resolves locale via: user > guild > default.
   */
  async tUser(
    userId: string,
    key: string,
    vars?: InterpolationVars,
    guildId?: string,
  ): Promise<string> {
    const locale = await this.getResolver().resolve(userId, guildId);
    return this.t(key, locale, vars);
  }

  /**
   * Translate with pluralization for a user. Resolves locale via: user > guild > default.
   */
  async tpUser(
    userId: string,
    key: string,
    count: number,
    vars?: InterpolationVars,
    guildId?: string,
  ): Promise<string> {
    const locale = await this.getResolver().resolve(userId, guildId);
    return this.tp(key, locale, count, vars);
  }

  /** Persist the user's preferred locale. */
  async setUserLocale(userId: string, locale: string): Promise<void> {
    await this.getStore().setUser(userId, locale);
  }

  /** Persist the guild's preferred locale. */
  async setGuildLocale(guildId: string, locale: string): Promise<void> {
    await this.getStore().setGuild(guildId, locale);
  }

  /** Retrieve the user's stored locale, or default. */
  async getUserLocale(userId: string): Promise<string> {
    return (await this.getStore().getUser(userId)) ?? LocaleRegistry.getDefault();
  }

  /** Retrieve the guild's stored locale, or default. */
  async getGuildLocale(guildId: string): Promise<string> {
    return (await this.getStore().getGuild(guildId)) ?? LocaleRegistry.getDefault();
  }

  /**
   * Resolve the effective locale for context.
   * Priority: user preference > guild preference > default.
   */
  async resolveLocale(userId?: string, guildId?: string): Promise<string> {
    return this.getResolver().resolve(userId, guildId);
  }

  /** List all registered locale identifiers. */
  locales(): Array<string> {
    return LocaleRegistry.locales();
  }

  /** Return the default locale identifier. */
  default(): string {
    return LocaleRegistry.getDefault();
  }

  /** True when `locale` is registered. */
  has(locale: string): boolean {
    return LocaleRegistry.has(locale);
  }
}
