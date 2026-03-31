export const HTTP_MESSAGES = {
  noConfig: 'HttpModule instantiated but no configuration found. Call defineHttp() in spraxium.config.ts.',
  noClient: 'HttpServer: Discord Client not injected and sharding is disabled.',
  shardingNoManager: '[spraxium/http] Sharding enabled but no ShardingManager was provided.',
  noClientNoShard: '[spraxium/http] No Discord Client provided and sharding is disabled.',
  poolRequiresUrl: 'WebhookPool requires at least one webhook URL.',
  started: (host: string, port: number) => `HTTP server listening on ${host}:${port}`,
  stopped: 'HTTP server stopped.',
  unhandledError: (msg: string) => `Unhandled error: ${msg}`,
} as const;
