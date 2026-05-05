import { Injectable } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { Cron, CronExpression, Interval, IntervalExpression } from '@spraxium/schedule';
import { ActivityType, Client } from 'discord.js';

const STATUSES = [
  { type: ActivityType.Watching, name: 'the server' },
  { type: ActivityType.Playing, name: 'with commands' },
  { type: ActivityType.Listening, name: 'your requests' },
  { type: ActivityType.Competing, name: 'moderation contests' },
] as const;

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private statusIndex = 0;

  constructor(private readonly client: Client) {}

  @Cron(CronExpression.EVERY_30_MINUTES, { name: 'rotate-presence' })
  async rotatePresence(): Promise<void> {
    const status = STATUSES[this.statusIndex % STATUSES.length];

    this.client.user?.setPresence({
      activities: [{ type: status.type, name: status.name }],
      status: 'online',
    });

    this.logger.info(`Presence rotated → ${ActivityType[status.type]} "${status.name}"`);
    this.statusIndex++;
  }

  @Interval(IntervalExpression.EVERY_5_MINUTES, { name: 'ping-check' })
  async logPing(): Promise<void> {
    const ping = this.client.ws.ping;
    this.logger.debug(`WebSocket ping: ${ping}ms`);
  }
}
