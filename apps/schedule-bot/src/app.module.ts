import { Module } from '@spraxium/common';
import { ScheduleModule } from '@spraxium/schedule';
import { JobsModule } from './modules/jobs/jobs.module';

@Module({
  imports: [ScheduleModule, JobsModule],
})
export class AppModule {}
