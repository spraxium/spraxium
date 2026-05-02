# @spraxium/logger

`@spraxium/logger` is the centralized logging package for the Spraxium ecosystem. It provides a zero-runtime-dependency logger built on native ANSI escape codes, with pluggable transports, token masking, configurable timestamp formats, and a static `TableBuilder` utility for rendering CLI tables. All output in Spraxium passes through this package — the core runtime, sharding manager, and command pipeline each use a context-scoped child logger derived from the root `Logger` instance.

The package ships four built-in log levels (`info`, `success`, `warn`, `error`) plus `debug` (opt-in via `Logger.setDebug(true)` or the `SPRAXIUM_DEBUG=true` environment variable) and `command` (used by the command logger). Custom levels can be registered at boot time with arbitrary ANSI colors. Transports are fully replaceable: the default `ConsoleTransport` writes to stdout/stderr, and `DiscordTransport` forwards log entries to a Discord channel or webhook. Both can be swapped or augmented with any object that implements the `LogTransport` interface.

## Installation

```bash
npm install @spraxium/logger
```

## Usage

```typescript
import { Logger, logger } from '@spraxium/logger';

// Root logger — no context label
logger.info('Bot is starting');
logger.warn('Config file not found, using defaults');

// Context-scoped logger — prefixes every line with [MyService]
const log = logger.child('MyService');
log.info('Initialized');
log.error('Something went wrong');

// Or instantiate directly
const log = new Logger('MyService');
```

```typescript
// Configure at boot (called automatically by SpraxiumFactory)
Logger.configure({
  timestampFormat: 'time-only',   // 'default' | 'iso' | 'time-only' | (d) => string
  maskTokens: true,
  levels: [
    { name: 'deploy', color: 'magenta' },
  ],
  discord: {
    webhookUrl: process.env.LOG_WEBHOOK,
  },
});
```

```typescript
// Custom transport
import type { LogTransport, LogEntry } from '@spraxium/logger';

class FileTransport implements LogTransport {
  readonly name = 'file';
  log(entry: LogEntry): void {
    // write to file...
  }
}

Logger.addTransport(new FileTransport());
```

```typescript
// CLI table output via TableBuilder
import { TableBuilder, ANSI, nativeLog } from '@spraxium/logger';

const table = TableBuilder.create([
  ANSI.bold(ANSI.cyan('Command')),
  ANSI.bold(ANSI.cyan('Status')),
]);
table.push([ANSI.cyan('/ping'), ANSI.green('registered')]);
nativeLog(table.toString());
```

## Timestamp formats

| Value | Example output |
|---|---|
| `'default'` | `02/05/2026 - 14:30:00` |
| `'iso'` | `2026-05-02T17:30:00.000Z` |
| `'time-only'` | `14:30:00` |
| `(d) => string` | any custom format |

## Links

[npm](https://www.npmjs.com/package/@spraxium/logger) · [GitHub](https://github.com/spraxium/spraxium) · [Documentation](https://spraxium.com)

## License

Apache 2.0
