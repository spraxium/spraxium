import chalk from 'chalk';
import Table from 'cli-table3';
import { ICONS } from '../constants/icons.constant';
import { MESSAGES } from '../constants/messages.constant';
import type { EnvDiffEntry } from '../interfaces/env-diff-entry.interface';
import type { FieldValidationResult } from '../interfaces/field-validation-result.interface';
import type { EnvFieldError } from '../validator/validation.error';

export class EnvPrinter {
  static printSuccess(results: Array<FieldValidationResult>): void {
    if (results.length === 0) return;
    if (process.env.SHARDS !== undefined) return;

    const table = new Table({
      head: [
        chalk.bold.cyan(MESSAGES.TABLE_VARIABLE),
        chalk.bold.cyan(MESSAGES.TABLE_VALUE),
        chalk.bold.cyan(MESSAGES.TABLE_SOURCE),
      ],
      style: { head: [], border: ['dim'] },
    });

    for (const { meta, raw, parsed, source } of results) {
      let val: string;
      if (raw !== undefined) {
        val = meta.secret ? chalk.gray(ICONS.SECRET_MASK) : chalk.green(String(parsed ?? raw).slice(0, 40));
      } else {
        val = chalk.gray(MESSAGES.ABSENT_OPTIONAL);
      }
      table.push([chalk.cyan(meta.envKey), val, chalk.dim(source)]);
    }

    console.log('');
    console.log(chalk.bold(MESSAGES.HEADER_ENVIRONMENT));
    console.log(chalk.dim(MESSAGES.DESC_LOADED_VARS));
    console.log(chalk.dim(MESSAGES.DESC_SECRETS_HINT));
    console.log('');
    console.log(table.toString());
    console.log('');
  }

  static printFailureAndExit(errors: Array<EnvFieldError>): never {
    console.log('');
    console.error(chalk.red.bold(` ${ICONS.ERROR}  ${MESSAGES.VALIDATION_FAILED}`));
    console.error('');
    EnvPrinter.printErrorList(errors);
    console.error('');
    process.exit(1);
  }

  static printReloadError(errors: Array<EnvFieldError>): void {
    console.error('');
    console.error(chalk.red.bold(` ${ICONS.ERROR}  ${MESSAGES.RELOAD_FAILED}`));
    console.error('');
    EnvPrinter.printErrorList(errors);
    console.error('');
  }

  static printReloadDiff(
    prevResults: Array<FieldValidationResult>,
    nextResults: Array<FieldValidationResult>,
  ): void {
    const prevByKey = new Map<string, FieldValidationResult>();
    for (const r of prevResults) prevByKey.set(r.meta.envKey, r);

    const changed: Array<EnvDiffEntry> = [];
    for (const next of nextResults) {
      const prev = prevByKey.get(next.meta.envKey);
      const isSecret = next.meta.secret;
      const prevVal = String(prev?.parsed ?? '');
      const nextVal = String(next.parsed ?? '');
      if (prevVal === nextVal) continue;

      changed.push({
        key: next.meta.envKey,
        from: isSecret ? ICONS.SECRET_MASK : chalk.dim(prevVal || MESSAGES.ABSENT),
        to: isSecret ? ICONS.SECRET_MASK : chalk.green(nextVal || MESSAGES.ABSENT),
        src: chalk.dim(next.source),
      });
    }

    if (changed.length === 0) return;

    const table = new Table({
      head: [
        chalk.bold.cyan(MESSAGES.TABLE_VARIABLE),
        chalk.bold.cyan(MESSAGES.TABLE_FROM),
        chalk.bold.cyan(MESSAGES.TABLE_TO),
        chalk.bold.cyan(MESSAGES.TABLE_SOURCE),
      ],
      style: { head: [], border: ['dim'] },
    });

    for (const row of changed) {
      table.push([chalk.cyan(row.key), row.from, row.to, row.src]);
    }

    console.log('');
    console.log(chalk.bold.cyan(` ${ICONS.RELOAD}  ${MESSAGES.RELOAD_SUCCESS}`));
    console.log('');
    console.log(table.toString());
    console.log('');
  }

  private static printErrorList(errors: Array<EnvFieldError>): void {
    for (const err of errors) {
      const label = EnvPrinter.reasonLabel(err.reason);
      const detail = err.message ? `  ${chalk.dim(err.message)}` : '';
      const received = err.received
        ? `  ${chalk.dim(`${MESSAGES.LABEL_RECEIVED}`)} ${err.secret ? ICONS.SECRET_MASK : chalk.yellow(err.received)}`
        : '';
      console.error(` ${chalk.red(ICONS.BULLET)} ${chalk.cyan(err.key)}  ${label}${received}${detail}`);
    }
  }

  private static reasonLabel(reason: EnvFieldError['reason']): string {
    switch (reason) {
      case 'missing':
        return chalk.red(MESSAGES.REASON_MISSING);
      case 'invalid_value':
        return chalk.yellow(MESSAGES.REASON_INVALID_VALUE);
      case 'enum_mismatch':
        return chalk.yellow(MESSAGES.REASON_ENUM_MISMATCH);
      case 'validation_failed':
        return chalk.yellow(MESSAGES.REASON_VALIDATION_FAILED);
    }
  }
}
