import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EnvFieldMeta } from '../src/interfaces/env-field.interface';
import { FieldValidator } from '../src/validator/field.validator';
import { EnvFieldError } from '../src/validator/validation.error';

afterEach(() => {
  vi.unstubAllEnvs();
});

function buildMeta(overrides: Partial<EnvFieldMeta> = {}): EnvFieldMeta {
  return {
    envKey: 'TEST_VAR',
    propertyKey: 'testVar',
    optional: false,
    secret: false,
    rules: [],
    ...overrides,
  };
}

describe('FieldValidator — missing values', () => {
  it('returns an EnvFieldError for a missing required field', () => {
    const result = FieldValidator.validate(buildMeta());
    expect(result.error).toBeInstanceOf(EnvFieldError);
    expect(result.error?.reason).toBe('missing');
    expect(result.error?.key).toBe('TEST_VAR');
  });

  it('returns no error for a missing optional field', () => {
    const result = FieldValidator.validate(buildMeta({ optional: true }));
    expect(result.error).toBeNull();
    expect(result.parsed).toBeUndefined();
  });

  it('reports source as "absent" when field is missing entirely', () => {
    const result = FieldValidator.validate(buildMeta({ optional: true }));
    expect(result.source).toBe('absent');
  });
});

describe('FieldValidator — value sources', () => {
  it('uses the value from process.env and marks source as "env"', () => {
    vi.stubEnv('TEST_VAR', 'from-env');
    const result = FieldValidator.validate(buildMeta());
    expect(result.raw).toBe('from-env');
    expect(result.source).toBe('env');
    expect(result.error).toBeNull();
  });

  it('falls back to defaultValue when env var is absent and marks source as "default"', () => {
    const result = FieldValidator.validate(buildMeta({ defaultValue: 'fallback' }));
    expect(result.raw).toBe('fallback');
    expect(result.source).toBe('default');
    expect(result.error).toBeNull();
  });

  it('prefers env value over default value', () => {
    vi.stubEnv('TEST_VAR', 'from-env');
    const result = FieldValidator.validate(buildMeta({ defaultValue: 'fallback' }));
    expect(result.raw).toBe('from-env');
    expect(result.source).toBe('env');
  });
});

describe('FieldValidator — transform rules', () => {
  it('applies a transform rule and returns the parsed value', () => {
    vi.stubEnv('TEST_VAR', '42');
    const meta = buildMeta({
      rules: [{ name: 'number', transform: (raw) => Number(raw) }],
    });
    const result = FieldValidator.validate(meta);
    expect(result.error).toBeNull();
    expect(result.parsed).toBe(42);
  });

  it('returns an EnvFieldError with invalid_value when transform throws', () => {
    vi.stubEnv('TEST_VAR', 'not-a-number');
    const meta = buildMeta({
      rules: [
        {
          name: 'number',
          transform: (raw) => {
            const n = Number(raw);
            if (Number.isNaN(n)) throw new Error('Not a valid number');
            return n;
          },
        },
      ],
    });
    const result = FieldValidator.validate(meta);
    expect(result.error).toBeInstanceOf(EnvFieldError);
    expect(result.error?.reason).toBe('invalid_value');
    expect(result.error?.received).toBe('not-a-number');
  });
});

describe('FieldValidator — validate rules', () => {
  it('returns no error when the validate rule passes', () => {
    vi.stubEnv('TEST_VAR', 'hello');
    const meta = buildMeta({
      rules: [{ name: 'minLength', validate: (v) => (String(v).length >= 3 ? null : 'Too short') }],
    });
    expect(FieldValidator.validate(meta).error).toBeNull();
  });

  it('returns an EnvFieldError when the validate rule fails', () => {
    vi.stubEnv('TEST_VAR', 'hi');
    const meta = buildMeta({
      rules: [{ name: 'minLength', validate: (v) => (String(v).length >= 3 ? null : 'Too short') }],
    });
    const result = FieldValidator.validate(meta);
    expect(result.error).toBeInstanceOf(EnvFieldError);
    expect(result.error?.reason).toBe('invalid_value');
    expect(result.error?.message).toBe('Too short');
  });

  it('skips transform if no transform property on rule', () => {
    vi.stubEnv('TEST_VAR', 'value');
    const meta = buildMeta({
      rules: [{ name: 'presence', validate: () => null }],
    });
    const result = FieldValidator.validate(meta);
    expect(result.error).toBeNull();
    expect(result.parsed).toBe('value');
  });
});

describe('FieldValidator — secret flag', () => {
  it('propagates secret=true into the error', () => {
    const meta = buildMeta({ secret: true });
    const result = FieldValidator.validate(meta);
    expect(result.error).toBeInstanceOf(EnvFieldError);
    expect(result.error?.secret).toBe(true);
  });
});
