# @spraxium/http

`@spraxium/http` exposes your Spraxium bot's internal state over a secured REST API. It wraps [Hono](https://hono.dev) with a decorator-based controller system where routes are defined with `@HttpController`, `@HttpGet`, `@HttpPost`, and other method decorators, and the module wires everything together at startup. Built-in middleware handles CORS, per-route rate limiting, body size limits, trusted proxy configuration, and a full set of security response headers all configured through a single options object.

The package introduces a `BotBridge` abstraction that lets HTTP handlers read Discord data regardless of whether the bot runs in a single process or across multiple shards. `DirectBotBridge` queries the local `Client` instance directly, while `ShardedBotBridge` fans requests out to the Discord.js shard manager. Built-in serializers for guilds, members, and bans convert Discord.js objects into plain JSON-friendly shapes ready to be returned from any endpoint.

## Installation

```bash
npm install @spraxium/http
```

## Usage

```typescript
import { Injectable } from '@spraxium/common';
import { HttpController, HttpGet, HttpCtx } from '@spraxium/http';
import type { Context } from 'hono';

@Injectable()
@HttpController('/status')
export class StatusController {
  @HttpGet('/')
  async getStatus(@HttpCtx() ctx: Context) {
    return ctx.json({ status: 'online' });
  }
}
```

```typescript
import { Module } from '@spraxium/common';
import { HttpClientModule } from '@spraxium/http';
import { StatusController } from './status.controller';

@Module({
  imports: [
    HttpClientModule.forRoot({
      port: 3000,
      cors: { origins: ['https://dashboard.example.com'] },
    }),
  ],
  providers: [StatusController],
})
export class AppModule {}
```

## Links

[npm](https://www.npmjs.com/package/@spraxium/http) · [GitHub](https://github.com/spraxium/spraxium) · [Hono](https://hono.dev) · [Documentation](https://spraxium.com)

## License

Apache 2.0
