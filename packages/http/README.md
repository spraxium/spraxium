# @spraxium/http

Deprecated. This package will be replaced as part of the framework stabilization. Avoid using it in new projects; migration details will follow before the stable release.

`@spraxium/http` exposes your Spraxium bot's internal state over a secured REST API. It wraps [Hono](https://hono.dev) with a decorator-based controller system where routes are defined with `@HttpController`, `@HttpGet`, `@HttpPost`, and other method decorators, and the module wires everything together at startup. Built-in middleware handles CORS, per-route rate limiting, body size limits, trusted proxy configuration, and a full set of security response headers all configured through a single options object.

The package introduces a `BotBridge` abstraction that lets HTTP handlers read Discord data regardless of whether the bot runs in a single process or across multiple shards. `DirectBotBridge` queries the local `Client` instance directly, while `ShardedBotBridge` fans requests out to the Discord.js shard manager. Built-in serializers for guilds, members, and bans convert Discord.js objects into plain JSON-friendly shapes ready to be returned from any endpoint.

## Installation

```bash
npm install @spraxium/http
```

## Usage

```typescript
// status.controller.ts
import { HttpController, HttpCtx, HttpGet } from '@spraxium/http';
import type { Context } from 'hono';

@HttpController('/status')
export class StatusController {
  @HttpGet('/')
  async index(@HttpCtx() ctx: Context): Promise<Response> {
    return ctx.json({ status: 'online' });
  }
}
```

```typescript
// http.module.ts: decorated with @HttpClientModule, not @Module
import { HttpClientModule } from '@spraxium/http';
import { StatusController } from './controllers/status.controller';

@HttpClientModule({
  controllers: [StatusController],
})
export class AppHttpModule {}
```

```typescript
// app.module.ts
import { Module } from '@spraxium/common';
import { HttpModule } from '@spraxium/http';

@Module({
  imports: [HttpModule],
})
export class AppModule {}
```

```typescript
// spraxium.config.ts: HTTP server config lives here, not in the module decorator
import { defineConfig } from '@spraxium/core';
import { defineHttp } from '@spraxium/http';

export default defineConfig({
  plugins: [
    defineHttp({
      port: 3000,
      cors: { origins: ['https://dashboard.example.com'] },
    }),
  ],
});
```

## Links

[npm](https://www.npmjs.com/package/@spraxium/http) · [GitHub](https://github.com/spraxium/spraxium) · [Hono](https://hono.dev) · [Documentation](https://spraxium.com)

## License

Apache 2.0
