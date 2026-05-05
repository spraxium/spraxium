import type { WebhookClient } from 'discord.js';

export interface WebhookEntry {
  name: string;
  url: string;
  client: WebhookClient;
}
