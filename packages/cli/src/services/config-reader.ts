import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createJiti } from 'jiti';
import type { SpraxiumDevConfig } from '../interfaces';

export class ConfigReader {
  async readDevConfig(cwd = process.cwd()): Promise<SpraxiumDevConfig> {
    const cfg = await this.loadConfig(cwd, 'development', true, false);
    return (cfg?.dev as SpraxiumDevConfig | undefined) ?? {};
  }

  private async loadConfig(
    cwd: string,
    mode: string,
    isDev: boolean,
    isProd: boolean,
  ): Promise<Record<string, unknown> | null> {
    const configPath = path.resolve(cwd, 'spraxium.config.ts');
    if (!fs.existsSync(configPath)) return null;

    try {
      const jiti = createJiti(pathToFileURL(configPath).href, { moduleCache: false, fsCache: false });
      const mod = (await jiti.import(configPath)) as { default?: unknown };
      const raw = mod.default ?? mod;
      const env = { mode, isDev, isProd, isNeutral: !isDev && !isProd };
      const resolved = typeof raw === 'function' ? (raw as (e: unknown) => unknown)(env) : raw;
      return (resolved as Record<string, unknown> | null) ?? null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(
        `[spraxium] Warning: Could not read config from spraxium.config.ts \u2014 ${msg}\n`,
      );
      return null;
    }
  }
}
