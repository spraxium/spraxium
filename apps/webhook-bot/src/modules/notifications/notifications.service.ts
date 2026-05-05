import { Injectable } from '@spraxium/common';
import type { SpraxiumOnReady } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { WebhookService } from '@spraxium/webhook';
import { EmbedBuilder } from 'discord.js';

@Injectable()
export class NotificationsService implements SpraxiumOnReady {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly webhook: WebhookService) {}

  async onReady(): Promise<void> {
    this.logger.info('Sending startup notification...');

    await this.webhook.send('logs', 'Bot is now online and ready.');

    const embed = new EmbedBuilder()
      .setTitle('Bot Online')
      .setDescription('All systems operational.')
      .setColor(0x57f287)
      .setTimestamp();

    await this.webhook.sendEmbed('alerts', embed);

    await this.webhook.sendAll('Startup complete, webhook-bot is live.');
  }

  async notifyGuildJoin(guildName: string, memberCount: number): Promise<void> {
    await this.webhook.formatAndSend(
      'logs',
      'Bot joined guild **{{guildName}}** ({{memberCount}} members).',
      { guildName, memberCount: String(memberCount) },
    );
  }

  async broadcastAlert(message: string): Promise<void> {
    await this.webhook.sendMany(['alerts', 'logs'], message);
  }

  async sendStatusReport(stats: { guilds: number; users: number; ping: number }): Promise<void> {
    const guildsEmbed = new EmbedBuilder()
      .setTitle('Guild Stats')
      .addFields({ name: 'Total Guilds', value: String(stats.guilds), inline: true })
      .setColor(0x5865f2);

    const pingEmbed = new EmbedBuilder()
      .setTitle('Performance')
      .addFields(
        { name: 'Users', value: String(stats.users), inline: true },
        { name: 'WS Ping', value: `${stats.ping} ms`, inline: true },
      )
      .setColor(0xfee75c);

    await this.webhook.sendEmbeds('reports', [guildsEmbed, pingEmbed]);
  }
}
