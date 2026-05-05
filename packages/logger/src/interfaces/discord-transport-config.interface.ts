import type { DiscordEmbedTemplate } from './discord-embed-template.interface';
import type { LogLevel } from './log-level.type';

export interface DiscordTransportConfig {
  /** Whether to post to a webhook URL or a channel via the bot client. */
  type: 'webhook' | 'channel';
  /**
   * Discord webhook URL.
   * Required when `type` is `'webhook'`.
   * Treat this value as a secret — never log it.
   */
  webhookUrl?: string;
  /**
   * Discord channel ID to post to via the bot client.
   * Required when `type` is `'channel'`.
   */
  channelId?: string;
  /** Log levels that will be forwarded to Discord. */
  levels: Array<LogLevel>;
  /** Optional embed template. Uses a sensible default when omitted. */
  embed?: DiscordEmbedTemplate;
}
