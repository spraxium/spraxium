import 'reflect-metadata';
import { ENV_SCHEMA_FILE_KEY, ENV_SCHEMA_METADATA_KEY } from '../constants/metadata-keys.constant';

function resolveCallerFilePath(): string | undefined {
  const stack = new Error().stack;
  if (!stack) return undefined;

  const lines = stack.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/\((.+?):\d+:\d+\)/) ?? line.match(/at (.+?):\d+:\d+\s*$/);
    if (!match) continue;
    const raw = match[1];
    if (raw.includes('env-schema.decorator') || raw.includes('node_modules')) continue;
    try {
      const url = new URL(raw);
      return decodeURIComponent(url.pathname.replace(/^\/([A-Z]:)/, '$1'));
    } catch {
      return raw;
    }
  }
  return undefined;
}

/**
 * Marks a class as an environment schema, enabling field validation and startup logging.
 * Apply this decorator to classes that extend `SpraxiumBaseEnv` or define `@Env()` fields.
 */
export function EnvSchema(): ClassDecorator {
  const callerFilePath = resolveCallerFilePath();

  return (target: object): void => {
    Reflect.defineMetadata(ENV_SCHEMA_METADATA_KEY, true, target);
    if (callerFilePath) {
      Reflect.defineMetadata(ENV_SCHEMA_FILE_KEY, callerFilePath, target);
    }
  };
}