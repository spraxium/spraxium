import type { PrefixConfig } from '@spraxium/common';
import type { SpraxiumLoggerConfig } from '@spraxium/logger';
import type { ExceptionOptions } from '../../exceptions/interfaces/exception-layout.interface';

export interface SpraxiumPlugin<N extends string = string, C = unknown> {
  readonly namespace: N;
  readonly config: C;
}

export type PluginFactory<N extends string, C> = ((config: C) => SpraxiumPlugin<N, C>) & {
  readonly namespace: N;
};

export interface SpraxiumDevConfig {
  /** Main entry file relative to project root. @default 'src/main.ts' */
  entrypoint?: string;
  /** Additional directories or files to watch for hot reload. */
  include?: Array<string>;
  /** Relative path patterns to skip when watching src/ (matched via String.includes). */
  exclude?: Array<string>;
  /** Milliseconds to wait before restarting after a detected change. @default 300 */
  debounce?: number;
}

export interface SpraxiumCoreConfig {
  debug?: boolean;
  plugins?: Array<SpraxiumPlugin>;
  dev?: SpraxiumDevConfig;
  logger?: SpraxiumLoggerConfig;
  /**
   * Exception handler configuration , layout mapping and logging behavior.
   *
   * Declare here (in `spraxium.config.ts`) rather than in the bootstrap options.
   *
   * @example
   * exceptions: {
   *   layouts: { default: MyErrorLayout, CooldownException: CooldownEmbedLayout }
   * }
   */
  exceptions?: ExceptionOptions;

  /**
   * Prefix command subsystem configuration.
   *
   * @example
   * prefix: {
   *   prefix: '!',
   *   guildPrefix: async (guildId) => db.getPrefix(guildId),
   *   caseSensitive: false,
   *   mentionPrefix: true,
   *   defaultCooldown: 3,
   * }
   */
  prefix?: PrefixConfig;
}

export interface ConfigEnv {
  mode: 'development' | 'neutral' | 'production';
  isDev: boolean;
  isNeutral: boolean;
  isProd: boolean;
}

export type SpraxiumConfigInput = SpraxiumCoreConfig;
export type SpraxiumConfigFn = (env: ConfigEnv) => SpraxiumConfigInput;
export type SpraxiumConfigExport = SpraxiumConfigInput | SpraxiumConfigFn;
