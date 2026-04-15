import type { LocaleData } from '../types/locale-data.type';

/**
 * Identity helper (no-op at runtime) that provides type-checking for translation files.
 *
 * @example
 * ```ts
 * // locales/commands/en-US.ts
 * import { defineTranslations } from '@spraxium/i18n';
 *
 * export default defineTranslations({
 *   ping: {
 *     name: 'ping',
 *     description: 'Check bot latency',
 *   },
 *   help: {
 *     name: 'help',
 *     description: 'Show available commands',
 *   },
 * });
 * ```
 */
export function defineTranslations<T extends LocaleData>(translations: T): T {
  return translations;
}
