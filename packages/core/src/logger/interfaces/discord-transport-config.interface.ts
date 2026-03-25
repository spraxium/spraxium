import type { DiscordEmbedTemplate } from './discord-embed-template.interface';
import type { LogLevel } from './log-level.type';

export interface DiscordTransportConfig {
  type: 'webhook' | 'channel';
  webhookUrl?: string;
  channelId?: string;
  levels: Array<LogLevel>;
  embed?: DiscordEmbedTemplate;
}
