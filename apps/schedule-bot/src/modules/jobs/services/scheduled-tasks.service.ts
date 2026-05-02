import { Injectable } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { Cron, CronExpression, Interval, IntervalExpression } from '@spraxium/schedule';
import type { Client } from 'discord.js';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(private readonly client: Client) {}

  @Interval(IntervalExpression.EVERY_MINUTE, { name: 'heartbeat' })
  async heartbeat(): Promise<void> {
    this.logger.debug(`Heartbeat - ping: ${this.client.ws.ping} ms`);
  }

  @Interval(IntervalExpression.EVERY_30_MINUTES, { name: 'status-report' })
  async statusReport(): Promise<void> {
    const guilds = this.client.guilds.cache.size;
    this.logger.info(`Status report - guilds: ${guilds}`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'daily-reset' })
  async dailyReset(): Promise<void> {
    this.logger.info('Daily reset triggered.');
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM, { name: 'morning-report' })
  async morningReport(): Promise<void> {
    this.logger.info('Good morning! Daily report running.');
  }
}
