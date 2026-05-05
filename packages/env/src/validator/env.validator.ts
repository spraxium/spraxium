import 'reflect-metadata';
import fs from 'node:fs';
import path from 'node:path';
import { ANSI } from '@spraxium/logger';
import { ICONS } from '../constants/icons.constant';
import { MESSAGES } from '../constants/messages.constant';
import { ENV_SCHEMA_METADATA_KEY } from '../constants/metadata-keys.constant';
import type { EnvFieldMeta, FieldValidationResult, ValidateOptions } from '../interfaces';
import { EnvPrinter } from '../printer/env.printer';
import { DotEnvParser } from '../utils/dotenv.parser';
import { MetadataHelper } from '../utils/metadata.util';
import { FieldValidator } from './field.validator';
import type { EnvFieldError } from './validation.error';

export class EnvValidator {
  private static readonly DOT_ENV_FILES = ['.env.local', '.env'];
  private static readonly POLL_MS = 500;
  private static readonly MAX_WAIT_MS = 5 * 60 * 1000;

  private static bootFields: Array<FieldValidationResult> = [];

  static getBootFields(): Array<FieldValidationResult> {
    return [...EnvValidator.bootFields];
  }

  static validate<T extends object>(schemaClass: new () => T, options?: ValidateOptions): T {
    const silent = options?.silent ?? false;

    EnvValidator.loadDotEnvFile();

    const hasMeta = Reflect.getMetadata(ENV_SCHEMA_METADATA_KEY, schemaClass);
    if (!hasMeta) {
      console.warn(MESSAGES.WARN_MISSING_SCHEMA(schemaClass.name));
    }

    const fieldsMap = MetadataHelper.collectAllFields(
      schemaClass as unknown as new (
        ...args: Array<unknown>
      ) => unknown,
    );
    const fields = Array.from(fieldsMap.values()).filter((f) => f.envKey !== '');

    let results = fields.map((f) => FieldValidator.validate(f));
    const errors = results
      .filter((r): r is FieldValidationResult & { error: EnvFieldError } => r.error !== null)
      .map((r) => r.error);

    if (errors.length > 0) {
      if (process.env.NODE_ENV !== 'development') {
        EnvPrinter.printFailureAndExit(errors);
      }

      results = EnvValidator.waitForEnvFix(fields, errors);
    }

    if (!silent) {
      EnvPrinter.printSuccess(results);
    }

    EnvValidator.bootFields = results;

    const instance = new schemaClass();
    for (const result of results) {
      if (result.parsed !== undefined) {
        (instance as Record<string, unknown>)[result.meta.propertyKey] = result.parsed;
      }
    }

    return instance;
  }

  private static waitForEnvFix(
    fields: Array<EnvFieldMeta>,
    initialErrors: Array<EnvFieldError>,
  ): Array<FieldValidationResult> {
    let errors = initialErrors;
    // Snapshot the field state before we start polling for fixes so we can
    // show the developer exactly which values changed once the env is valid.
    let prevResults: Array<FieldValidationResult> = fields.map((f) => FieldValidator.validate(f));

    EnvPrinter.printReloadError(errors);
    console.log(ANSI.yellow(MESSAGES.WATCHING_ENV) + ANSI.dim(MESSAGES.HINT_SAVE_TO_RETRY));

    let elapsed = 0;

    while (errors.length > 0) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, EnvValidator.POLL_MS);
      elapsed += EnvValidator.POLL_MS;

      if (elapsed >= EnvValidator.MAX_WAIT_MS) {
        console.error(ANSI.red(`\n${ICONS.ERROR} ${MESSAGES.TIMED_OUT}\n`));
        EnvPrinter.printFailureAndExit(errors);
      }

      EnvValidator.reloadEnvFromDisk();

      const nextResults = fields.map((f) => FieldValidator.validate(f));
      const nextErrors = nextResults
        .filter((r): r is FieldValidationResult & { error: EnvFieldError } => r.error !== null)
        .map((r) => r.error);

      if (nextErrors.length === 0) {
        console.log(ANSI.green(`${ICONS.SUCCESS} ${MESSAGES.ENV_FIXED}`));
        // Show the developer precisely which env values they just changed.
        // Secrets are masked by the printer itself.
        EnvPrinter.printReloadDiff(prevResults, nextResults);
        return nextResults;
      }

      if (nextErrors.length !== errors.length) {
        EnvPrinter.printReloadError(nextErrors);
        errors = nextErrors;
      }
      // Advance the previous snapshot so the diff on eventual success shows
      // the last observed state against the successful reload, not the very
      // first state from before any fixes were applied.
      prevResults = nextResults;
    }

    return fields.map((f) => FieldValidator.validate(f));
  }

  private static findDotEnvFile(): string | undefined {
    for (const name of EnvValidator.DOT_ENV_FILES) {
      const candidate = path.resolve(process.cwd(), name);
      if (fs.existsSync(candidate)) return candidate;
    }
    return undefined;
  }

  private static loadDotEnvFile(): void {
    const envFile = EnvValidator.findDotEnvFile();
    if (!envFile) return;

    let content: string;
    try {
      content = fs.readFileSync(envFile, 'utf-8');
    } catch {
      return;
    }

    const vars = DotEnvParser.parse(content);
    for (const [key, value] of Object.entries(vars)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }

  private static reloadEnvFromDisk(): void {
    const envFile = EnvValidator.findDotEnvFile();
    if (!envFile) return;

    try {
      const content = fs.readFileSync(envFile, 'utf-8');
      const vars = DotEnvParser.parse(content);
      for (const [key, value] of Object.entries(vars)) {
        process.env[key] = value;
      }
    } catch {}
  }
}
