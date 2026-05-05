# @spraxium/webhook

`@spraxium/webhook` provides a decorator-based Discord webhook management layer for Spraxium bots. You register named webhook URLs once in `spraxium.config.ts` via `defineWebhook`, import `WebhookModule` in your app module, and inject `WebhookService` anywhere in your application. The service resolves named webhooks at runtime so your business logic never holds a raw URL or manages `WebhookClient` instances directly.

The package also provides `@WebhookSender()` and `@Send(name)` decorators for a declarative approach. Decorate a class with `@WebhookSender()` and any of its methods with `@Send('webhookName')`, and the framework automatically forwards the method's return value to the named webhook every time the method is called. String returns become content, `EmbedBuilder` returns become embeds, and any `MessageCreateOptions` object is forwarded as-is.

## Installation

```bash
npm install @spraxium/webhook
```

## Usage

```typescript
// spraxium.config.ts
import { defineConfig } from '@spraxium/core';
import { defineWebhook } from '@spraxium/webhook';

export default defineConfig({
  plugins: [
    defineWebhook({
      webhooks: {
        alerts: process.env.WEBHOOK_ALERTS ?? '',
        logs: process.env.WEBHOOK_LOGS ?? '',
        reports: process.env.WEBHOOK_REPORTS ?? '',
      },
      globalUsername: 'MyBot',
    }),
  ],
});
```

```typescript
// Using WebhookService directly
import { Injectable } from '@spraxium/common';
import { WebhookService } from '@spraxium/webhook';
import { EmbedBuilder } from 'discord.js';

@Injectable()
export class AlertsService {
  constructor(private readonly webhooks: WebhookService) {}

  async sendAlert(message: string): Promise<void> {
    await this.webhooks.send('alerts', message);
  }

  async sendReport(embed: EmbedBuilder): Promise<void> {
    await this.webhooks.sendEmbed('reports', embed);
  }

  async broadcastMaintenance(): Promise<void> {
    await this.webhooks.sendAll('Scheduled maintenance starting in 5 minutes.');
  }

  async sendFormatted(guildName: string, count: number): Promise<void> {
    await this.webhooks.formatAndSend(
      'logs',
      'Guild {{guild}} now has {{count}} members.',
      { guild: guildName, count: String(count) },
    );
  }
}
```

```typescript
// Using @WebhookSender() + @Send() declarative approach
import { WebhookSender, Send } from '@spraxium/webhook';
import { EmbedBuilder } from 'discord.js';

@WebhookSender()
export class DailyReportsService {
  @Send('reports')
  async buildDailyReport(): Promise<EmbedBuilder> {
    return new EmbedBuilder()
      .setTitle('Daily Report')
      .setDescription(`Report for ${new Date().toDateString()}`)
      .setColor(0x5865f2);
  }
}
```

## WebhookService API

| Method | Description |
|---|---|
| `send(name, content, options?)` | Send plain text to a named webhook |
| `sendEmbed(name, embed, options?)` | Send a single `EmbedBuilder` |
| `sendEmbeds(name, embeds, options?)` | Send multiple embeds in one message |
| `sendMessage(name, message, options?)` | Send a full `MessageCreateOptions` payload |
| `sendMany(names, content, options?)` | Send text to multiple webhooks in parallel |
| `sendAll(content, options?)` | Broadcast text to all registered webhooks |
| `formatAndSend(name, template, vars, options?)` | Interpolate `{{var}}` template and send |
| `format(template, vars)` | Interpolate template without sending |
| `get(name)` | Get the raw `WebhookEntry` with its `WebhookClient` |
| `isRegistered(name)` | Check if a webhook alias is registered |
| `registered()` | List all registered webhook aliases |

## Links

[npm](https://www.npmjs.com/package/@spraxium/webhook) · [GitHub](https://github.com/spraxium/spraxium) · [Discord Webhooks](https://discord.com/developers/docs/resources/webhook) · [Documentation](https://spraxium.com)

## License

Apache 2.0
