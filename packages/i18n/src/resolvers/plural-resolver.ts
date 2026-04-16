import { I18N_DEFAULTS } from '../constants/i18n-defaults.constant';
import { LocaleRegistry } from '../registry/locale-registry';
import type { InterpolationVars } from '../types/interpolation-vars.type';
import type { PluralCategory, PluralRule } from '../types/plural-rule.type';
import { LocaleInterpolator } from './locale-interpolator';

/**
 * Resolves plural forms from translation keys.
 *
 * Convention: keys ending with `_zero`, `_one`, `_two`, `_few`, `_many`, `_other`
 * are plural variants. The `count` variable selects the correct one via `Intl.PluralRules`.
 */
export class PluralResolver {
  private static customRules = new Map<string, PluralRule>();

  static setRules(rules: Record<string, PluralRule>): void {
    for (const [locale, rule] of Object.entries(rules)) {
      PluralResolver.customRules.set(locale, rule);
    }
  }

  static resolve(key: string, locale: string, count: number, vars?: InterpolationVars): string {
    const category = PluralResolver.getCategory(locale, count);
    const map = LocaleRegistry.get(locale);
    const sep = I18N_DEFAULTS.PLURAL_SEPARATOR;

    const candidateKey = `${key}${sep}${category}`;
    let raw = map.get(candidateKey);

    if (raw === undefined && category !== 'other') {
      raw = map.get(`${key}${sep}other`);
    }

    // Fallback to default locale
    if (raw === undefined && locale !== LocaleRegistry.getDefault()) {
      const defaultMap = LocaleRegistry.get(LocaleRegistry.getDefault());
      raw = defaultMap.get(candidateKey) ?? defaultMap.get(`${key}${sep}other`);
    }

    if (raw === undefined) return key;

    const allVars = { count, ...vars };
    return LocaleInterpolator.interpolate(raw, allVars);
  }

  private static getCategory(locale: string, count: number): PluralCategory {
    const custom = PluralResolver.customRules.get(locale);
    if (custom) return custom(count);

    try {
      const rules = new Intl.PluralRules(locale);
      return rules.select(count) as PluralCategory;
    } catch {
      return count === 1 ? 'one' : 'other';
    }
  }

  static reset(): void {
    PluralResolver.customRules.clear();
  }
}
