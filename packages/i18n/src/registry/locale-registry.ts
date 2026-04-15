import type { LocaleData } from '../types/locale-data.type';

/**
 * Singleton that holds all flattened locale maps.
 * Initialized once at boot before module loading.
 * All lookups are O(1) Map.get(), zero tree traversal at request time.
 */
export class LocaleRegistry {
  private static readonly flatMaps = new Map<string, Map<string, string>>();
  private static defaultLocale = 'en-US';

  static initialize(defaultLocale: string, locales: Record<string, LocaleData>): void {
    LocaleRegistry.flatMaps.clear();
    LocaleRegistry.defaultLocale = defaultLocale;

    for (const [locale, data] of Object.entries(locales)) {
      LocaleRegistry.flatMaps.set(locale, LocaleRegistry.flatten(data, ''));
    }
  }

  /** Register a named reference under each locale. */
  static registerReference(name: string, locales: Record<string, LocaleData>): void {
    for (const [locale, data] of Object.entries(locales)) {
      const existing = LocaleRegistry.flatMaps.get(locale) ?? new Map<string, string>();
      const flattened = LocaleRegistry.flatten(data, name);

      for (const [k, v] of flattened) {
        existing.set(k, v);
      }

      LocaleRegistry.flatMaps.set(locale, existing);
    }
  }

  static get(locale: string): Map<string, string> {
    return (
      LocaleRegistry.flatMaps.get(locale) ??
      LocaleRegistry.flatMaps.get(LocaleRegistry.defaultLocale) ??
      new Map<string, string>()
    );
  }

  static getDefault(): string {
    return LocaleRegistry.defaultLocale;
  }

  static locales(): Array<string> {
    return [...LocaleRegistry.flatMaps.keys()];
  }

  static has(locale: string): boolean {
    return LocaleRegistry.flatMaps.has(locale);
  }

  static getAllFlatMaps(): ReadonlyMap<string, Map<string, string>> {
    return LocaleRegistry.flatMaps;
  }

  static reset(): void {
    LocaleRegistry.flatMaps.clear();
    LocaleRegistry.defaultLocale = 'en-US';
  }

  private static flatten(obj: LocaleData, prefix: string): Map<string, string> {
    const map = new Map<string, string>();

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        map.set(fullKey, value);
      } else if (typeof value === 'object' && value !== null) {
        const nested = LocaleRegistry.flatten(value, fullKey);
        for (const [k, v] of nested) {
          map.set(k, v);
        }
      }
    }

    return map;
  }
}
