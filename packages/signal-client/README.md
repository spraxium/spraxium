# @spraxium/signal-client

`@spraxium/signal-client` is a minimal, zero-dependency package for sending signal envelopes to a Spraxium bot from any external service. It exposes a `WebhookPool` that rotates across multiple webhook URLs with per-webhook rate limit tracking, a `FallbackWorker` that retries failed sends using either a local file store or a Redis store, and a top-level `SignalClient` that composes these pieces behind a single `send` method. Because there are no production dependencies, the client can be dropped into any Node.js service, edge runtime, or serverless function without affecting bundle size.

The envelope sent is a plain JSON object containing the event name, an optional guild ID, a timestamp, and the typed payload. The receiver is a Spraxium bot running `@spraxium/signal`, which validates the envelope and routes it to the registered handler. This makes it straightforward to trigger bot-side logic from a web dashboard, a background worker, or any other service without coupling them directly to the bot process.

## Installation

```bash
npm install @spraxium/signal-client
```

## Usage

```typescript
import { SignalClient } from '@spraxium/signal-client';

const client = new SignalClient({
  webhooks: [
    'https://discord.com/api/webhooks/111/token-a',
    'https://discord.com/api/webhooks/222/token-b',
  ],
});

await client.send({
  event: 'config.update',
  guildId: '123456789',
  payload: { prefix: '!' },
});
```

```typescript
// With Redis fallback for resilience
import { SignalClient, RedisFallbackStore } from '@spraxium/signal-client';
import Redis from 'ioredis';

const client = new SignalClient({
  webhooks: ['https://discord.com/api/webhooks/111/token-a'],
  fallback: {
    store: new RedisFallbackStore(new Redis()),
  },
});
```

## Links

[npm](https://www.npmjs.com/package/@spraxium/signal-client) · [GitHub](https://github.com/spraxium/spraxium) · [Documentation](https://spraxium.com)

## License

Apache 2.0
