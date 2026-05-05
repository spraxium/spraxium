import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FieldValidationResult } from '../src/interfaces';
import { EnvPrinter } from '../src/printer/env.printer';

/**
 * Tests for Phase 2.3 - `EnvPrinter.printReloadDiff()` is now invoked by
 * `EnvValidator.waitForEnvFix()` after a successful hot-reload. This file
 * covers the printer's output contract at the unit level; the integration
 * (printer being called from the validator) is verified by building the
 * package and by manual hot-reload smoke testing.
 */

function buildResult(
  envKey: string,
  parsed: string | undefined,
  source: 'env' | 'default' | 'absent',
  secret = false,
): FieldValidationResult {
  return {
    meta: {
      envKey,
      propertyKey: envKey.toLowerCase(),
      optional: false,
      secret,
      rules: [],
    },
    raw: parsed,
    parsed,
    error: null,
    source,
  };
}

describe('EnvPrinter.printReloadDiff', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('does not print when nothing changed', () => {
    const prev = [buildResult('FOO', 'bar', 'env')];
    const next = [buildResult('FOO', 'bar', 'env')];

    EnvPrinter.printReloadDiff(prev, next);

    expect(logSpy).not.toHaveBeenCalled();
  });

  it('prints a diff table when a value changes', () => {
    const prev = [buildResult('FOO', 'old', 'env')];
    const next = [buildResult('FOO', 'new', 'env')];

    EnvPrinter.printReloadDiff(prev, next);

    const joined = logSpy.mock.calls.map((c) => String(c[0] ?? '')).join('\n');
    expect(joined).toContain('FOO');
    expect(joined).toContain('old');
    expect(joined).toContain('new');
  });

  it('masks secret values in the diff', () => {
    const prev = [buildResult('SECRET', 'old-secret', 'env', true)];
    const next = [buildResult('SECRET', 'new-secret', 'env', true)];

    EnvPrinter.printReloadDiff(prev, next);

    const joined = logSpy.mock.calls.map((c) => String(c[0] ?? '')).join('\n');
    // Values must not leak; the printer replaces them with a mask icon.
    expect(joined).not.toContain('old-secret');
    expect(joined).not.toContain('new-secret');
    expect(joined).toContain('SECRET');
  });

  it('handles transitions from absent to present', () => {
    const prev = [buildResult('OPTIONAL_FLAG', undefined, 'absent')];
    const next = [buildResult('OPTIONAL_FLAG', 'on', 'env')];

    EnvPrinter.printReloadDiff(prev, next);

    const joined = logSpy.mock.calls.map((c) => String(c[0] ?? '')).join('\n');
    expect(joined).toContain('OPTIONAL_FLAG');
    expect(joined).toContain('on');
  });
});
