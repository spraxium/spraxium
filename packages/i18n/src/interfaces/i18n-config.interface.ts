import type { PluralRule } from '../types/plural-rule.type';

export interface I18nReference {
  /** Identifier used as translation key namespace, e.g. `'commands'`. */
  name: string;
  /** Path to the locale directory. Each subfolder is a locale (e.g. `en-US/`, `pt-BR/`). */
  path: string;
}

export interface I18nConfig {
  /** Default locale identifier, e.g. `'en-US'`. */
  defaultLocale: string;
  /**
   * References to locale directories.
   * Each reference maps a name to a path containing per-locale files.
   *
   * @example
   * ```ts
   * references: [
   *   { name: 'commands', path: './locales/commands' },
   *   { name: 'messages', path: './locales/messages' },
   * ]
   * ```
   */
  references: Array<I18nReference>;
  /** Custom plural rules keyed by locale. Falls back to `Intl.PluralRules`. */
  pluralRules?: Record<string, PluralRule>;
}
