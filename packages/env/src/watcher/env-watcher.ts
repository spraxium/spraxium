import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import type { EnvFieldMeta } from '../interfaces/env-field.interface';
import type { FieldValidationResult } from '../interfaces/field-validation-result.interface';
import { EnvPrinter } from '../printer/env.printer';
import { DotEnvParser } from '../utils/dotenv.parser';
import { FieldValidator } from '../validator/field.validator';
import type { EnvFieldError } from '../validator/validation.error';

type ReloadCallback = (nextResults: Array<FieldValidationResult>) => void;

function isRunningUnderTsxWatch(): boolean {
  if (process.env.TSX_WATCH) return true;
  return process.argv.some((arg) => arg.includes('_tsx'));
}

export function findDotEnvFile(): string | undefined {
  for (const name of ['.env.local', '.env']) {
    const candidate = path.resolve(process.cwd(), name);
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

export class EnvWatcher {
  private pollingIntervals = new Map<string, NodeJS.Timeout>();
  private lastMtimes = new Map<string, number>();
  private debounceTimer: NodeJS.Timeout | null = null;
  private fields: Array<EnvFieldMeta> = [];
  private currentResults: Array<FieldValidationResult> = [];

  start(
    envFilePath: string,
    schemaFilePath: string,
    fields: EnvFieldMeta[],
    initialResults: FieldValidationResult[],
    onReload: ReloadCallback,
  ): void {
    this.fields = fields;
    this.currentResults = [...initialResults];

    const resolvedEnvPath = envFilePath
      ? path.resolve(process.cwd(), path.basename(envFilePath))
      : path.resolve(process.cwd(), '.env');

    if (!fs.existsSync(resolvedEnvPath)) {
      console.warn(chalk.yellow('\n\u26a0  No .env file found at process.cwd() \u2014 watching disabled\n'));
      return;
    }

    this.watchWithPolling(resolvedEnvPath, () => {
      this.reloadEnvFile(resolvedEnvPath);

      const nextResults = this.fields.map((f) => FieldValidator.validate(f));
      const errors = nextResults
        .filter((r): r is FieldValidationResult & { error: EnvFieldError } => r.error !== null)
        .map((r) => r.error);

      if (errors.length > 0) {
        EnvPrinter.printReloadError(errors);
        return;
      }

      EnvPrinter.printReloadDiff(this.currentResults, nextResults);
      this.currentResults = nextResults;
      onReload(nextResults);
    });

    if (schemaFilePath) {
      if (isRunningUnderTsxWatch()) {
        console.info(
          chalk.cyan(
            '\u2139  Schema changes are handled by tsx watch \u2014 process will restart automatically\n',
          ),
        );
      } else {
        const resolvedSchemaPath = path.resolve(schemaFilePath);
        if (fs.existsSync(resolvedSchemaPath)) {
          this.watchWithPolling(resolvedSchemaPath, () => {
            console.warn(
              chalk.yellow(
                '\n\u26a0  Env schema file changed \u2014 restart required to apply structural changes\n',
              ),
            );
          });
        }
      }
    }
  }

  stop(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    for (const interval of this.pollingIntervals.values()) {
      clearInterval(interval);
    }
    this.pollingIntervals.clear();
    this.lastMtimes.clear();
  }

  private watchWithPolling(filePath: string, onChange: () => void): void {
    try {
      this.lastMtimes.set(filePath, fs.statSync(filePath).mtimeMs);
    } catch {
      this.lastMtimes.set(filePath, 0);
    }

    const interval = setInterval(() => {
      try {
        const mtime = fs.statSync(filePath).mtimeMs;
        if (mtime !== (this.lastMtimes.get(filePath) ?? 0)) {
          this.lastMtimes.set(filePath, mtime);
          this.debounce(onChange, 300);
        }
      } catch {
        /* file temporarily missing */
      }
    }, 500);

    interval.unref();
    this.pollingIntervals.set(filePath, interval);
  }

  private debounce(fn: () => void, ms: number): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      fn();
    }, ms);
  }

  private reloadEnvFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const vars = DotEnvParser.parse(content);
      for (const [key, value] of Object.entries(vars)) {
        process.env[key] = value;
      }
    } catch {
      /* file temporarily missing */
    }
  }
}
