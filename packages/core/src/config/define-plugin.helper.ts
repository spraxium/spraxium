import type { PluginFactory, SpraxiumPlugin } from './interfaces';

/**
 * Creates a typed plugin factory for use in `defineConfig({ plugins: [...] })`.
 *
 * @example
 * ```ts
 * // In your plugin package:
 * export const analytics = definePlugin<'analytics', AnalyticsConfig>('analytics');
 *
 * // In spraxium.config.ts:
 * import { analytics } from '@spraxium/analytics';
 * export default defineConfig({
 *   plugins: [analytics({ enabled: true })],
 * });
 *
 * // In your service:
 * const config = ConfigStore.getPluginConfig(analytics); // typed as AnalyticsConfig | undefined
 * ```
 */
export function definePlugin<N extends string, C = unknown>(namespace: N): PluginFactory<N, C> {
  function factory(config: C): SpraxiumPlugin<N, C> {
    return { namespace, config };
  }
  (factory as unknown as { namespace: N }).namespace = namespace;
  return factory as PluginFactory<N, C>;
}
