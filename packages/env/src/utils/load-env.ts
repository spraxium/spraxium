import fs from 'node:fs';
import path from 'node:path';
import { DotEnvParser } from './dotenv.parser';

const DOT_ENV_FILES = ['.env.local', '.env'] as const;

/**
 * Synchronously loads a `.env` file into `process.env`, identical to `dotenv/config`.
 *
 * File search order (relative to `cwd`): `.env.local` → `.env`.
 * Already-set environment variables are **not overwritten** unless `override` is `true`.
 *
 * Designed as a zero-dependency drop-in for `import 'dotenv/config'` in contexts
 * that run outside the Spraxium runtime (e.g. `prisma.config.ts`, seed scripts).
 *
 * @example
 * // prisma.config.ts
 * import { loadEnv } from '@spraxium/env';
 * loadEnv();
 *
 * @param options.path     Explicit path to a `.env` file. Skips auto-discovery.
 * @param options.override When `true`, existing `process.env` values are overwritten.
 */
export function loadEnv(options?: { path?: string; override?: boolean }): void {
  const filePath = options?.path ?? findDotEnvFile();
  if (!filePath) return;

  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return;
  }

  const vars = DotEnvParser.parse(content);
  const override = options?.override ?? false;

  for (const [key, value] of Object.entries(vars)) {
    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function findDotEnvFile(): string | undefined {
  for (const name of DOT_ENV_FILES) {
    const candidate = path.resolve(process.cwd(), name);
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}
