import { Global, Module } from '@spraxium/common';
import { ScheduleLifecycle } from './schedule.lifecycle';
import { ScheduleRegistry } from './schedule.registry';
import { ScheduleService } from './schedule.service';

@Global()
@Module({
  providers: [ScheduleRegistry, ScheduleService, ScheduleLifecycle],
  exports: [ScheduleService],
})
export class ScheduleModule {}
