import { Injectable } from '@spraxium/common';
import { Cron, CronExpression } from '@spraxium/schedule';

@Injectable()
export class UserSyncTask {
  @Cron(CronExpression.EVERY_HOUR)
  async execute(): Promise<void> {

  }
}
