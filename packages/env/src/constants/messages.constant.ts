import { ICONS } from './icons.constant';

export const MESSAGES = {
  WARN_MISSING_SCHEMA: (name: string) =>
    `[spraxium/env] Warning: ${name} is not decorated with @EnvSchema(). Validation will still run, but this is not recommended.`,
  WATCHING_ENV: `${ICONS.EYES}  Watching .env for changes`,
  HINT_SAVE_TO_RETRY: ` (save the file to retry ${ICONS.EM_DASH} Ctrl+C to exit)\n`,
  TIMED_OUT: 'Timed out waiting for .env fix.',
  ENV_FIXED: `.env fixed ${ICONS.EM_DASH} continuing boot...\n`,

  HEADER_ENVIRONMENT: ' Environment',
  DESC_LOADED_VARS: ' Loaded environment variables for the current runtime context.',
  DESC_SECRETS_HINT: ` Secrets are masked by default ${ICONS.EM_DASH} use { secret: false } in @Env() to reveal a value.`,
  ABSENT_OPTIONAL: `(absent ${ICONS.EM_DASH} optional)`,
  ABSENT: '(absent)',
  LABEL_RECEIVED: 'received:',

  TABLE_VARIABLE: 'Variable',
  TABLE_VALUE: 'Value',
  TABLE_SOURCE: 'Source',
  TABLE_FROM: 'From',
  TABLE_TO: 'To',

  VALIDATION_FAILED: 'Environment validation failed',
  RELOAD_FAILED: `Environment reload failed ${ICONS.EM_DASH} running with previous values`,
  RELOAD_SUCCESS: 'Environment reloaded',

  REASON_MISSING: 'missing',
  REASON_INVALID_VALUE: 'invalid value',
  REASON_ENUM_MISMATCH: 'not in allowed values',
  REASON_VALIDATION_FAILED: 'validation failed',

  VALIDATION_ERROR: (count: number) => `Environment validation failed with ${count} error(s)`,
  VALIDATION_ERROR_NAME: 'EnvValidationError',

  EXPECTED_STRING: 'Expected a string',
  EXPECTED_BOOLEAN: (value: unknown) =>
    `Expected "true", "false", "1", or "0" (case-insensitive), got "${value}"`,
  EXPECTED_NUMBER: (value: unknown) => `Expected a number, got "${value}"`,
  EXPECTED_INTEGER: (value: unknown) => `Expected an integer, got "${value}"`,
  EXPECTED_PORT: (value: unknown) => `Expected a port number, got "${value}"`,
  PORT_RANGE: (value: number) => `Port must be between 1 and 65535, got ${value}`,
  EXPECTED_VALID_JSON: 'Expected valid JSON',
  EXPECTED_ENUM: (joined: string) => `Expected one of: ${joined}`,
  EXPECTED_URL: (value: unknown) => `Expected a valid URL, got "${value}"`,
  EXPECTED_EMAIL: (value: unknown) => `Expected a valid email address, got "${value}"`,
  EXPECTED_HOST: 'Expected a hostname or IP address',
  EXPECTED_HOST_INVALID: (value: unknown) => `Expected a valid hostname or IP address, got "${value}"`,
  EXPECTED_MONGO_URI: 'Expected a MongoDB URI starting with "mongodb://" or "mongodb+srv://"',
  EXPECTED_REDIS_URI: 'Expected a Redis URI starting with "redis://" or "rediss://"',
  EXPECTED_DISCORD_TOKEN_SEGMENTS: (count: number) =>
    `Expected a Discord bot token (three base64url segments), got ${count} segment(s)`,
  DISCORD_TOKEN_INVALID_CHARS: `Discord token contains invalid characters ${ICONS.EM_DASH} expected base64url segments`,
  DISCORD_TOKEN_LENGTH: (length: number) => `Discord token length out of range (got ${length})`,
  EXPECTED_DISCORD_ID: (value: unknown) =>
    `Expected a Discord snowflake ID (17${ICONS.EN_DASH}19 digits), got "${value}"`,
  EXPECTED_DISCORD_WEBHOOK_URL: (value: unknown) =>
    `Expected a Discord webhook URL (https://discord.com/api/webhooks/{id}/{token}), got "${value}"`,
  DISCORD_CLIENT_SECRET_LENGTH: (length: number) =>
    `Discord client secret length out of range (expected 24${ICONS.EN_DASH}64 chars, got ${length})`,
  DISCORD_CLIENT_SECRET_WHITESPACE: 'Discord client secret must not contain whitespace',
  EXPECTED_DISCORD_PERMISSIONS: (value: unknown) =>
    `Expected a Discord permission bitfield (non-negative integer string), got "${value}"`,
  CUSTOM_VALIDATION_FAILED: 'Custom validation failed',
  MIN_VALUE: (min: number, value: number) => `Expected a value >= ${min}, got ${value}`,
  MAX_VALUE: (max: number, value: number) => `Expected a value <= ${max}, got ${value}`,
  IS_POSITIVE: (value: number) => `Expected a positive number (> 0), got ${value}`,
  IS_NEGATIVE: (value: number) => `Expected a negative number (< 0), got ${value}`,
  MIN_LENGTH: (min: number, got: number) => `Expected at least ${min} character(s), got ${got}`,
  MAX_LENGTH: (max: number, got: number) => `Expected at most ${max} character(s), got ${got}`,
  MATCHES: (pattern: string, value: unknown) => `Expected value to match ${pattern}, got "${value}"`,
  URL_HTTPS_REQUIRED: (value: unknown) => `Expected an HTTPS URL, got "${value}"`,
};
