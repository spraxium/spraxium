# @spraxium/signal

`@spraxium/signal` implements an async, unidirectional event system for Spraxium bots using Discord webhooks as the transport layer. A signal is a typed envelope containing an event name, an optional guild ID, a timestamp, and a Zod-validated payload. External services dispatch signals by posting to a Discord webhook that delivers the message to a private channel monitored by the bot. The bot reads each message, verifies the HMAC-SHA256 signature, deduplicates by nonce, and routes the payload to the correct handler.

Handlers are defined with the `@SignalListener` class decorator and the `@OnSignal` method decorator. Each `@OnSignal` registration can optionally declare a Zod schema, and the framework validates the incoming payload against it before calling the handler. Because handlers are resolved through the Spraxium DI container, they can inject any registered service and behave identically to other components in the application.

## Installation

```bash
npm install @spraxium/signal
```

Signal schemas require Zod 4.6.6 or newer within the 4.x release line. Projects using Zod 3 should
upgrade their direct `zod` dependency before passing schemas to `@OnSignal`:

```bash
npm install zod@^4.6.6
```

Set explicit collection limits such as `.max()` or `.length()` for untrusted payloads. Patched Zod
releases reject collections exceeding these bounds before validating individual elements.

## Usage

```typescript
// Listener class: handles incoming signals
import { Injectable } from '@spraxium/common';
import { OnSignal, SignalListener } from '@spraxium/signal';
import type { SignalEnvelope } from '@spraxium/signal';
import { z } from 'zod';

const configUpdateSchema = z.object({ prefix: z.string().min(1).max(5) });

@SignalListener()
export class ConfigUpdateListener {
  @OnSignal('config.update', {
    schema: configUpdateSchema,
  })
  async onConfigUpdate(
    payload: { prefix: string },
    envelope: SignalEnvelope,
  ): Promise<void> {
    console.log(`Guild ${envelope.guildId} updated prefix to ${payload.prefix}`);
  }
}
```

```typescript
// app.module.ts
import { Module } from '@spraxium/common';
import { SignalModule } from '@spraxium/signal';
import { ConfigUpdateListener } from './config-update.listener';

@Module({
  imports: [SignalModule],
  providers: [ConfigUpdateListener],
})
export class AppModule {}
```

```typescript
// spraxium.config.ts: signal config lives here
import { defineConfig } from '@spraxium/core';
import { defineSignal } from '@spraxium/signal';

export default defineConfig({
  plugins: [
    defineSignal({
      channelId: process.env.SIGNAL_CHANNEL_ID ?? '',
      allowedWebhookIds: [process.env.SIGNAL_WEBHOOK_ID ?? ''],
      hmacSecret: process.env.SIGNAL_HMAC_SECRET ?? '',
      deleteAfterProcessing: true,
    }),
  ],
});
```

## Nonce persistence

Signal keeps nonces in memory by default. Use `persistNonces: true` to save them to `.spraxium/signal-nonces.json` or `persistNonces: { path }` to choose the file. You can also provide your own `NonceStore` with `persistNonces: { store }`.

For multiple bot instances, install `ioredis` and configure Redis in `defineSignal`. In this example, `env` contains validated environment variables and `REDIS_PORT` is a number.

```typescript
import { defineSignal } from '@spraxium/signal';
import { env } from './env';

export const signal = defineSignal({
  channelId: env.SIGNAL_CHANNEL_ID,
  allowedWebhookIds: [env.SIGNAL_WEBHOOK_ID],
  hmacSecret: env.SIGNAL_HMAC_SECRET,
  persistNonces: {
    type: 'redis',
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    username: env.REDIS_USERNAME,
    password: env.REDIS_PASSWORD,
    keyPrefix: 'my-bot:prod:signal:nonce:',
  },
});
```

Redis settings default to host `127.0.0.1`, port `6379`, database `0`, and prefix `spraxium:signal:nonce:`. Set `tls: true` if your provider requires TLS and `username` if it uses a named ACL user. Replicas of the same bot should use the same database and prefix. Use a separate prefix for each bot or deployment environment that shares a Redis server.

Built-in stores retain each nonce for 10 minutes and 30 seconds to cover the timestamp acceptance window and allow for clock differences between receivers. Redis reserves each nonce atomically before dispatch. Signal checks its Redis connection at startup and drops signals that it cannot reserve. The Redis server's persistence and eviction settings determine whether it retains those keys across its own restarts or when memory runs low.

## Links

[npm](https://www.npmjs.com/package/@spraxium/signal) · [GitHub](https://github.com/spraxium/spraxium) · [Zod](https://zod.dev) · [Documentation](https://spraxium.com)

## License

Apache 2.0
