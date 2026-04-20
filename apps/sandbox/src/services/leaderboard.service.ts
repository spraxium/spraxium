import { Injectable } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import { Cron, CronExpression, ScheduleService } from '@spraxium/schedule';
import { AppEnv } from '../app.env';

export interface LeaderboardEntry {
  userId: string;
  points: number;
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);
  private rankings: LeaderboardEntry[] = [];

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly env: AppEnv
  ) {}

  addPoints(userId: string, points: number): void {
    console.log('Enviroment', this.env.DISCORD_WEB);
    const existing = this.rankings.find(e => e.userId === userId);

    if (existing) {
      existing.points += points;
    } else {
      this.rankings.push({ userId, points });
    }
  }

  getTop(limit = 10): LeaderboardEntry[] {
    return [...this.rankings].sort((a, b) => b.points - a.points).slice(0, limit);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'daily-leaderboard-reset',
    runOnInit: true,
  })
  async resetDailyLeaderboard(): Promise<void> {
    const snapshot = this.getTop(3);
    this.logger.info(`Daily reset — top 3: ${JSON.stringify(snapshot)}`);
    this.rankings = [];
  }

  @Cron(CronExpression.EVERY_MONDAY_AT_MIDNIGHT, { name: 'weekly-leaderboard-reset' })
  async resetWeeklyLeaderboard(): Promise<void> {
    const job = this.scheduleService.get('daily-leaderboard-reset');

    if (job) {
      this.scheduleService.pause('daily-leaderboard-reset');
      this.logger.info('Weekly reset fired — pausing daily job temporarily');
    }

    this.rankings = [];

    if (job) {
      this.scheduleService.resume('daily-leaderboard-reset');
    }

    this.logger.info('Weekly leaderboard cleared');
  }
}
