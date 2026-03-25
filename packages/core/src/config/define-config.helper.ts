import type { ConfigEnv, SpraxiumConfigExport, SpraxiumConfigInput } from './interfaces';

/**
 * Define Spraxium configuration.
 *
 * @example
 * ```ts
 * import { defineConfig } from '@spraxium/core';
 * import { analytics } from '@spraxium/analytics';
 *
 * export default defineConfig({
 *   debug: true,
 *   plugins: [
 *     analytics({ enabled: true, trackingId: 'GA-123' }),
 *   ],
 * });
 * ```
 */
export function defineConfig(
  config: SpraxiumConfigInput | ((env: ConfigEnv) => SpraxiumConfigInput),
): SpraxiumConfigExport {
  return config;
}
