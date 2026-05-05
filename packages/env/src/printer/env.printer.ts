import { ANSI, TableBuilder, nativeError, nativeLog } from '@spraxium/logger';
import { ICONS } from '../constants/icons.constant';
import { MESSAGES } from '../constants/messages.constant';
import type { EnvDiffEntry, FieldValidationResult } from '../interfaces';
import type { EnvFieldError } from '../validator/validation.error';

export class EnvPrinter {
  static printSuccess(results: Array<FieldValidationResult>): void {
    if (results.length === 0) return;
    if (process.env.SHARDS !== undefined) return;

    const table = TableBuilder.create([
      ANSI.bold(ANSI.cyan(MESSAGES.TABLE_VARIABLE)),
      ANSI.bold(ANSI.cyan(MESSAGES.TABLE_VALUE)),
      ANSI.bold(ANSI.cyan(MESSAGES.TABLE_SOURCE)),
    ]);

    for (const { meta, parsed, source } of results) {
      let val: string;
      if (source !== 'absent') {
        val = meta.secret ? ANSI.gray(ICONS.SECRET_MASK) : ANSI.green(String(parsed).slice(0, 40));
      } else {
        val = ANSI.gray(MESSAGES.ABSENT_OPTIONAL);
      }
      table.push([ANSI.cyan(meta.envKey), val, ANSI.dim(source)]);
    }

    nativeLog('');
    nativeLog(ANSI.bold(MESSAGES.HEADER_ENVIRONMENT));
    nativeLog(ANSI.dim(MESSAGES.DESC_LOADED_VARS));
    nativeLog(ANSI.dim(MESSAGES.DESC_SECRETS_HINT));
    nativeLog('');
    nativeLog(table.toString());
    nativeLog('');
  }

  static printFailureAndExit(errors: Array<EnvFieldError>): never {
    nativeLog('');
    nativeError(ANSI.red(ANSI.bold(` ${ICONS.ERROR}  ${MESSAGES.VALIDATION_FAILED}`)));
    nativeError('');
    EnvPrinter.printErrorList(errors);
    nativeError('');
    process.exit(1);
  }

  static printReloadError(errors: Array<EnvFieldError>): void {
    nativeError('');
    nativeError(ANSI.red(ANSI.bold(` ${ICONS.ERROR}  ${MESSAGES.RELOAD_FAILED}`)));
    nativeError('');
    EnvPrinter.printErrorList(errors);
    nativeError('');
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
        from: isSecret ? ICONS.SECRET_MASK : ANSI.dim(prevVal || MESSAGES.ABSENT),
        to: isSecret ? ICONS.SECRET_MASK : ANSI.green(nextVal || MESSAGES.ABSENT),
        src: ANSI.dim(next.source),
      });
    }

    if (changed.length === 0) return;

    const table = TableBuilder.create([
      ANSI.bold(ANSI.cyan(MESSAGES.TABLE_VARIABLE)),
      ANSI.bold(ANSI.cyan(MESSAGES.TABLE_FROM)),
      ANSI.bold(ANSI.cyan(MESSAGES.TABLE_TO)),
      ANSI.bold(ANSI.cyan(MESSAGES.TABLE_SOURCE)),
    ]);

    for (const row of changed) {
      table.push([ANSI.cyan(row.key), row.from, row.to, row.src]);
    }

    nativeLog('');
    nativeLog(ANSI.bold(ANSI.cyan(` ${ICONS.RELOAD}  ${MESSAGES.RELOAD_SUCCESS}`)));
    nativeLog('');
    nativeLog(table.toString());
    nativeLog('');
  }

  private static printErrorList(errors: Array<EnvFieldError>): void {
    for (const err of errors) {
      const label = EnvPrinter.reasonLabel(err.reason);
      const detail = err.message ? `  ${ANSI.dim(err.message)}` : '';
      const received = err.received
        ? `  ${ANSI.dim(`${MESSAGES.LABEL_RECEIVED}`)} ${err.secret ? ICONS.SECRET_MASK : ANSI.yellow(err.received)}`
        : '';
      nativeError(` ${ANSI.red(ICONS.BULLET)} ${ANSI.cyan(err.key)}  ${label}${received}${detail}`);
    }
  }

  private static reasonLabel(reason: EnvFieldError['reason']): string {
    switch (reason) {
      case 'missing':
        return ANSI.red(MESSAGES.REASON_MISSING);
      case 'invalid_value':
        return ANSI.yellow(MESSAGES.REASON_INVALID_VALUE);
      case 'enum_mismatch':
        return ANSI.yellow(MESSAGES.REASON_ENUM_MISMATCH);
      case 'validation_failed':
        return ANSI.yellow(MESSAGES.REASON_VALIDATION_FAILED);
    }
  }
}
