import { Injectable } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import { AfterOnline, Cron, CronExpression, Timeout, TimeoutExpression } from '@spraxium/schedule';
import { Client, TextChannel } from 'discord.js';

const ANNOUNCEMENT_CHANNEL_ID = process.env['ANNOUNCEMENT_CHANNEL_ID'] ?? '';
const OWNER_ID = process.env['OWNER_ID'] ?? '';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(private readonly client: Client) {}

  @AfterOnline(0, { name: 'guild-warmup' })
  async warmupGuildCache(): Promise<void> {
    const guilds = this.client.guilds.cache;
    this.logger.info(`Warming up ${guilds.size} guild(s)...`);

    for (const guild of guilds.values()) {
      await guild.members.fetch().catch(() => null);
    }

    this.logger.info('Guild member cache warmed up');
  }

  @Timeout(TimeoutExpression.AFTER_10_SECONDS, { name: 'startup-dm' })
  async notifyOwnerOnStartup(): Promise<void> {
    if (!OWNER_ID) return;

    const owner = await this.client.users.fetch(OWNER_ID).catch(() => null);
    if (!owner) return;

    await owner.send('Bot is online and ready.').catch(() => null);
    this.logger.info(`Startup DM sent to owner ${OWNER_ID}`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM, { name: 'daily-announcement' })
  async sendDailyAnnouncement(): Promise<void> {
    if (!ANNOUNCEMENT_CHANNEL_ID) return;

    const channel = this.client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID);
    if (!(channel instanceof TextChannel)) return;

    await channel.send({
      content: `Good morning! Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`,
    });

    this.logger.info('Daily announcement sent');
  }
}
