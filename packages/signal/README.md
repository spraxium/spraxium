# @spraxium/signal

`@spraxium/signal` implements an async, unidirectional event system for Spraxium bots using Discord webhooks as the transport layer. A signal is a typed envelope containing an event name, an optional guild ID, a timestamp, and a Zod-validated payload. External services dispatch signals by posting to a webhook URL, and the bot's HTTP endpoint receives them and routes each signal to the correct handler, enabling loosely coupled communication without a message broker or additional infrastructure.

Handlers are defined with the `@SignalListener` class decorator and the `@OnSignal` method decorator. Each `@OnSignal` registration can optionally declare a Zod schema, and the framework validates the incoming payload against it before calling the handler. Because handlers are resolved through the Spraxium DI container, they can inject any registered service and behave identically to other components in the application.

## Installation

```bash
npm install @spraxium/signal
```

## Usage

```typescript
import { Injectable } from '@spraxium/common';
import { SignalListener, OnSignal } from '@spraxium/signal';
import type { SignalEnvelope } from '@spraxium/signal';
import { z } from 'zod';

@Injectable()
@SignalListener()
export class ConfigSignalListener {
  @OnSignal('config.update', {
    schema: z.object({ prefix: z.string().min(1).max(5) }),
  })
  async onConfigUpdate(
    payload: { prefix: string },
    envelope: SignalEnvelope,
  ): Promise<void> {
    console.log(`Guild ${envelope.guildId} updated prefix to ${payload.prefix}`);
  }
}
```

## Links

[npm](https://www.npmjs.com/package/@spraxium/signal) · [GitHub](https://github.com/spraxium/spraxium) · [Zod](https://zod.dev) · [Documentation](https://spraxium.com)

## License

Apache 2.0
