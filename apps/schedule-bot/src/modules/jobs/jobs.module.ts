import { Module } from '@spraxium/common';
import { ScheduledTasksService } from './services/scheduled-tasks.service';
import { StartupTasksService } from './services/startup-tasks.service';

@Module({
  providers: [StartupTasksService, ScheduledTasksService],
})
export class JobsModule {}
