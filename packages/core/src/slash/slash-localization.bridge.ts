import type { SlashI18nKeys } from '@spraxium/common';
import type { SlashLocalizationResult } from './interfaces/slash-localization.interface';
import type { SlashLocalizationMap } from './types/slash-localization.type';

export type { SlashLocalizationMap, SlashLocalizationResult };

type SlashLocalizationProvider = (keys: SlashI18nKeys) => SlashLocalizationResult;

/**
 * Zero-dependency bridge between the slash registrar and @spraxium/i18n.
 *
 * Core cannot import i18n (circular: i18n has core as peer dep).
 * Instead, i18n calls `setProvider()` during its boot lifecycle,
 * and the slash registrar calls `resolve()` when it finds an `i18n` field.
 *
 * When no provider is registered (i18n plugin not configured),
 * `resolve()` returns null and the registrar skips localizations silently.
 */
export class SlashLocalizationBridge {
  private static provider: SlashLocalizationProvider | null = null;

  static setProvider(fn: SlashLocalizationProvider): void {
    SlashLocalizationBridge.provider = fn;
  }

  static resolve(keys: SlashI18nKeys): SlashLocalizationResult | null {
    return SlashLocalizationBridge.provider ? SlashLocalizationBridge.provider(keys) : null;
  }

  static reset(): void {
    SlashLocalizationBridge.provider = null;
  }
}
