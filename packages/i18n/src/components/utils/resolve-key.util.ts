import { LocaleRegistry } from '../../registry/locale-registry';

export function resolveKey(key: string | undefined, locale: string): string | undefined {
  if (!key) return undefined;
  return LocaleRegistry.get(locale).get(key) ?? undefined;
}
