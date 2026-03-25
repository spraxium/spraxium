import type { PluginFactory, SpraxiumCoreConfig, SpraxiumPlugin } from './interfaces';

export class ConfigStore {
  private static config: SpraxiumCoreConfig = {};

  static load(config: SpraxiumCoreConfig): void {
    ConfigStore.config = config;
  }

  static getCoreConfig(): Omit<SpraxiumCoreConfig, 'plugins'> {
    const { plugins: _plugins, ...core } = ConfigStore.config;
    return core;
  }

  static getPluginConfig<N extends string, C>(factory: PluginFactory<N, C>): C | undefined {
    const plugins: Array<SpraxiumPlugin> = ConfigStore.config.plugins ?? [];
    const entry = plugins.find((p) => p.namespace === factory.namespace);
    return entry?.config as C | undefined;
  }

  static getRaw(): Readonly<SpraxiumCoreConfig> {
    return ConfigStore.config;
  }

  static reset(): void {
    ConfigStore.config = {};
  }
}
