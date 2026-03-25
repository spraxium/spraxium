export type BuiltInLogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug' | 'command';

export type LogLevel = BuiltInLogLevel | (string & {});
