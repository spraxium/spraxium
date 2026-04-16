import { existsSync } from 'node:fs';
import { register } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ConfigConstant } from '../constants';
import type { SpraxiumDevConfig } from '../interfaces';

export class ConfigReader {
  private loaderRegistered = false;

  async readDevConfig(cwd = process.cwd()): Promise<SpraxiumDevConfig> {
    const configPath = this.findConfigFile(cwd);
    if (!configPath) return {};

    this.ensureLoader(configPath);

    try {
      const fileUrl = `${pathToFileURL(configPath).href}?t=${Date.now()}`;
      const imported = await import(fileUrl);
      const raw = imported.default ?? imported;
      const env = { mode: 'development', isDev: true, isProd: false, isNeutral: false };
      const resolved = typeof raw === 'function' ? raw(env) : raw;
      return (resolved?.dev as SpraxiumDevConfig | undefined) ?? {};
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`[spraxium] Warning: Could not read config \u2014 ${msg}\n`);
      return {};
    }
  }

  private findConfigFile(cwd: string): string | null {
    for (const name of ConfigConstant.FILE_NAMES) {
      const filePath = path.resolve(cwd, name);
      if (existsSync(filePath)) return filePath;
    }
    return null;
  }

  private ensureLoader(configPath: string): void {
    if (this.loaderRegistered || !configPath.endsWith('.ts')) return;
    register('@swc-node/register/esm', import.meta.url);
    this.loaderRegistered = true;
  }
}
