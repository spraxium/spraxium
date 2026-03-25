import type { PresenceOptions } from '../interfaces';

export function mergePresence(
  base: PresenceOptions,
  override: Partial<Pick<PresenceOptions, 'status' | 'activities' | 'rotateInterval'>>,
): PresenceOptions {
  return { ...base, ...override, activities: override.activities ?? base.activities };
}
