import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createJiti } from 'jiti';
import type { SpraxiumDevConfigInterface } from '../interfaces';

export class ConfigReader {
  async readDevConfig(cwd = process.cwd()): Promise<SpraxiumDevConfigInterface> {
    const configPath = path.resolve(cwd, 'spraxium.config.ts');
    if (!fs.existsSync(configPath)) return {};

    try {
      const jiti = createJiti(pathToFileURL(configPath).href, { moduleCache: false, fsCache: false });
      const mod = (await jiti.import(configPath)) as { default?: unknown };
      const raw = mod.default ?? mod;
      const env = { mode: 'development', isDev: true, isProd: false };
      const resolved = typeof raw === 'function' ? (raw as (e: unknown) => unknown)(env) : raw;
      const cfg = resolved as Record<string, unknown> | null | undefined;
      return (cfg?.dev as SpraxiumDevConfigInterface | undefined) ?? {};
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(
        `[spraxium] Warning: Could not read dev config from spraxium.config.ts — ${msg}\n`,
      );
      return {};
    }
  }
}
