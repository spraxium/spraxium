import { Injectable } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { AfterOnline, Timeout, TimeoutExpression } from '@spraxium/schedule';
import type { Client } from 'discord.js';

@Injectable()
export class StartupTasksService {
  private readonly logger = new Logger(StartupTasksService.name);

  constructor(private readonly client: Client) {}

  @AfterOnline(0, { name: 'log-guilds' })
  async logGuilds(): Promise<void> {
    const count = this.client.guilds.cache.size;
    this.logger.info(`Bot is online - serving ${count} guild(s).`);
  }

  @AfterOnline(5_000, { name: 'late-init' })
  async lateInit(): Promise<void> {
    this.logger.info('Late initialization completed (5 s after ready).');
  }

  @Timeout(TimeoutExpression.AFTER_5_SECONDS, { name: 'startup-ping' })
  async startupPing(): Promise<void> {
    this.logger.info(`WebSocket ping: ${this.client.ws.ping} ms`);
  }

  @Timeout(TimeoutExpression.AFTER_10_SECONDS, { name: 'startup-summary' })
  async startupSummary(): Promise<void> {
    const userCount = this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    this.logger.info(`Startup summary - total members: ${userCount}`);
  }
}
