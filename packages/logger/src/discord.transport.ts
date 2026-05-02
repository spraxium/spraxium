import { nativeWarn } from './console.transport';
import { DISCORD_LEVEL_COLORS, DISCORD_MAX_QUEUE_SIZE } from './constants';
import type {
  ClientAwareTransport,
  DiscordEmbedTemplate,
  DiscordTransportConfig,
  LogEntry,
  SendableChannel,
} from './interfaces';
import { formatDate, formatTime, interpolateTemplate } from './utils';

/**
 * Minimal APIEmbed shape — mirrors discord.js `APIEmbed` without importing discord.js.
 * Only the fields actually used by this transport are declared.
 */
interface PartialEmbed {
  title?: string;
  description?: string;
  color?: number;
  timestamp?: string;
  footer?: { text: string };
  thumbnail?: { url: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}

export class DiscordTransport implements ClientAwareTransport {
  readonly name = 'discord';

  /** discord.js `Client` — typed as `unknown` to avoid a hard dependency. */
  private client?: unknown;

  private readonly queue: Array<LogEntry> = [];
  private readonly recentlySent = new Map<string, number>();

  constructor(private readonly config: DiscordTransportConfig) {}

  setClient(client: unknown): void {
    this.client = client;

    const c = client as {
      isReady(): boolean;
      once(event: string, cb: () => void): void;
      channels: { cache: Map<string, unknown> };
    };

    if (c.isReady()) {
      this.flushQueue();
    } else {
      c.once('clientReady', () => this.flushQueue());
    }
  }

  log(entry: LogEntry): void | Promise<void> {
    if (!this.config.levels.includes(entry.level)) return;
    if (this.isDuplicate(entry)) return;

    if (this.config.type === 'webhook') {
      return this.sendWebhook(entry);
    }

    const c = this.client as { isReady(): boolean } | undefined;
    if (!c?.isReady()) {
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

    // Evict old entries to prevent unbounded map growth.
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
      const c = this.client as { channels: { cache: Map<string, unknown> } };
      const raw = c.channels.cache.get(this.config.channelId);

      if (!raw) return;

      if (typeof (raw as Record<string, unknown>).send !== 'function') return;

      const embed = this.buildEmbed(entry);
      await (raw as SendableChannel).send({ embeds: [embed] });
    } catch {
      nativeWarn('[Spraxium] Discord channel transport failed');
    }
  }

  private buildEmbed(entry: LogEntry): PartialEmbed {
    const vars = this.buildVars(entry);
    const template = this.config.embed;

    if (!template) return this.defaultEmbed(entry);
    return this.applyTemplate(template, entry, vars);
  }

  private applyTemplate(
    template: DiscordEmbedTemplate,
    entry: LogEntry,
    vars: Record<string, string>,
  ): PartialEmbed {
    const embed: PartialEmbed = {};

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

  private defaultEmbed(entry: LogEntry): PartialEmbed {
    return {
      title: `${entry.level.toUpperCase()}${entry.context ? ` · ${entry.context}` : ''}`,
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
