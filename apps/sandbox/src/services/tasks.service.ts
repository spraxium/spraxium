import { Injectable } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import { AfterOnline, Timeout, TimeoutExpression } from '@spraxium/schedule';

@Injectable()
export class TasksService {
  private readonly logger: Logger = new Logger(TasksService.name);

  @AfterOnline(5_000, { name: 'late-init' })
  async lateInit(): Promise<void> {
    this.logger.info('Late initialization 15s after boot');
  }

  @Timeout(TimeoutExpression.AFTER_5_SECONDS, { name: 'timeout-5-sec' })
  async timeoutFunction() {
    this.logger.info('This function runs once, 5 seconds after the app booted');
  }
}
