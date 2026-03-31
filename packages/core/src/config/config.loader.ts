import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { logger } from '../logger';
import { ConfigStore } from './config.store';
import { CONFIG_FILE_NAMES } from './constants';
import type { ConfigEnv, SpraxiumConfigExport, SpraxiumConfigInput } from './interfaces';

export class ConfigLoader {
  static async load(projectRoot?: string): Promise<SpraxiumConfigInput> {
    const root = projectRoot ?? process.cwd();
    const configPath = ConfigLoader.findConfigFile(root);

    if (!configPath) {
      logger.debug('No spraxium.config found, using defaults');
      const config: SpraxiumConfigInput = {};
      ConfigStore.load(config);
      return config;
    }

    logger.debug(`Loading config from ${configPath}`);

    const fileUrl = pathToFileURL(configPath).href;
    const imported = await import(fileUrl);
    const raw: SpraxiumConfigExport = imported.default ?? imported;

    const env = ConfigLoader.resolveEnv();
    const config: SpraxiumConfigInput = typeof raw === 'function' ? raw(env) : raw;

    ConfigStore.load(config);
    return config;
  }

  private static findConfigFile(root: string): string | null {
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
      const prodCandidates = [
        join(root, '.spraxium', 'dist', 'spraxium.config.js'),
        join(root, 'dist', 'spraxium.config.js'),
        join(root, 'spraxium.config.js'),
        join(root, 'spraxium.config.mjs'),
      ];
      for (const p of prodCandidates) {
        if (existsSync(p)) return p;
      }
    }

    for (const name of CONFIG_FILE_NAMES) {
      const filePath = join(root, name);
      if (existsSync(filePath)) {
        return filePath;
      }
    }

    return null;
  }

  private static resolveEnv(): ConfigEnv {
    const nodeEnv = process.env.NODE_ENV ?? 'development';
    const mode =
      nodeEnv === 'production'
        ? 'production'
        : nodeEnv === 'neutral' || nodeEnv === 'staging' || nodeEnv === 'test'
          ? 'neutral'
          : 'development';
    return {
      mode,
      isDev: mode === 'development',
      isNeutral: mode === 'neutral',
      isProd: mode === 'production',
    };
  }
}
