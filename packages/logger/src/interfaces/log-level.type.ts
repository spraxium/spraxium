/** Built-in log levels recognized by all transports. */
export type BuiltInLogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug' | 'command';

/** Any built-in level, or an arbitrary custom string level. */
export type LogLevel = BuiltInLogLevel | (string & {});
