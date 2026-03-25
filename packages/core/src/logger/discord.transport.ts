import type { APIEmbed, Client } from 'discord.js';
import { nativeWarn } from './console.transport';
import { DISCORD_LEVEL_COLORS, DISCORD_MAX_QUEUE_SIZE } from './constants';
import type {
  ClientAwareTransport,
  DiscordEmbedTemplate,
  DiscordTransportConfig,
  LogEntry,
} from './interfaces';
import { formatDate, formatTime, interpolateTemplate } from './utils';

export class DiscordTransport implements ClientAwareTransport {
  readonly name = 'discord';
  private client?: Client;
  private readonly queue: Array<LogEntry> = [];
  private readonly recentlySent = new Map<string, number>();

  constructor(private readonly config: DiscordTransportConfig) {}

  setClient(client: unknown): void {
    this.client = client as Client;

    if (this.client.isReady()) {
      this.flushQueue();
    } else {
      this.client.once('clientReady', () => this.flushQueue());
    }
  }

  log(entry: LogEntry): void | Promise<void> {
    if (!this.config.levels.includes(entry.level)) return;
    if (this.isDuplicate(entry)) return;

    if (this.config.type === 'webhook') {
      return this.sendWebhook(entry);
    }

    if (!this.client?.isReady()) {
      if (this.queue.length < DISCORD_MAX_QUEUE_SIZE) {
        this.queue.push(entry);
      }
      return;
    }

    return this.sendChannel(entry);
  }

  async close(): Promise<void> {
    this.queue.length = 0;
  }

  private flushQueue(): void {
    const entries = this.queue.splice(0);
    for (const entry of entries) {
      void this.sendChannel(entry);
    }
  }

  private isDuplicate(entry: LogEntry): boolean {
    const now = Date.now();
    const signature = this.buildSignature(entry);
    const last = this.recentlySent.get(signature);

    // Prevent accidental duplicate sends from double hook/listener execution.
    if (last !== undefined && now - last < 1000) {
      return true;
    }

    this.recentlySent.set(signature, now);

    // Keep the map compact.
    for (const [key, ts] of this.recentlySent) {
      if (now - ts > 5000) {
        this.recentlySent.delete(key);
      }
    }

    return false;
  }

  private buildSignature(entry: LogEntry): string {
    const metadata = entry.metadata ? JSON.stringify(entry.metadata) : '';
    return `${entry.level}|${entry.context ?? ''}|${entry.message}|${metadata}`;
  }

  private async sendWebhook(entry: LogEntry): Promise<void> {
    if (!this.config.webhookUrl) return;

    try {
      const embed = this.buildEmbed(entry);
      await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });
    } catch {
      nativeWarn('[Spraxium] Discord webhook transport failed');
    }
  }

  private async sendChannel(entry: LogEntry): Promise<void> {
    if (!this.config.channelId || !this.client) return;

    try {
      const channel = this.client.channels.cache.get(this.config.channelId);
      if (!channel?.isTextBased() || !('send' in channel)) return;

      const embed = this.buildEmbed(entry);
      await (channel as { send(opts: { embeds: Array<APIEmbed> }): Promise<unknown> }).send({
        embeds: [embed],
      });
    } catch {
      nativeWarn('[Spraxium] Discord channel transport failed');
    }
  }

  private buildEmbed(entry: LogEntry): APIEmbed {
    const vars = this.buildVars(entry);
    const template = this.config.embed;

    if (!template) return this.defaultEmbed(entry, vars);
    return this.applyTemplate(template, entry, vars);
  }

  private applyTemplate(
    template: DiscordEmbedTemplate,
    entry: LogEntry,
    vars: Record<string, string>,
  ): APIEmbed {
    const embed: APIEmbed = {};

    if (template.title) embed.title = interpolateTemplate(template.title, vars);
    if (template.description) embed.description = interpolateTemplate(template.description, vars);

    embed.color = template.color ?? DISCORD_LEVEL_COLORS[entry.level.toUpperCase()] ?? 0x95a5a6;

    if (template.timestamp) embed.timestamp = entry.timestamp.toISOString();
    if (template.footer) embed.footer = { text: interpolateTemplate(template.footer.text, vars) };
    if (template.thumbnail) embed.thumbnail = template.thumbnail;

    if (template.fields) {
      embed.fields = template.fields.map((f) => ({
        name: interpolateTemplate(f.name, vars),
        value: interpolateTemplate(f.value, vars),
        inline: f.inline,
      }));
    }

    return embed;
  }

  private defaultEmbed(entry: LogEntry, vars: Record<string, string>): APIEmbed {
    return {
      title: `${vars.level}${entry.context ? ` — ${entry.context}` : ''}`,
      description: entry.message,
      color: DISCORD_LEVEL_COLORS[entry.level.toUpperCase()] ?? 0x95a5a6,
      timestamp: entry.timestamp.toISOString(),
      footer: entry.shard !== undefined ? { text: `Shard ${entry.shard}` } : undefined,
    };
  }

  private buildVars(entry: LogEntry): Record<string, string> {
    const vars: Record<string, string> = {
      level: entry.level.toUpperCase(),
      message: entry.message,
      context: entry.context ?? '',
      shard: entry.shard !== undefined ? String(entry.shard) : 'N/A',
      timestamp: entry.timestamp.toISOString(),
      date: formatDate(entry.timestamp),
      time: formatTime(entry.timestamp),
    };

    if (entry.metadata) {
      for (const [key, value] of Object.entries(entry.metadata)) {
        vars[key] = String(value);
      }
    }

    return vars;
  }
}
