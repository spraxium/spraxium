import { Global, Module } from '@spraxium/common';
import { ScheduleLifecycle } from './runtime/schedule.lifecycle';
import { ScheduleRegistry } from './runtime/schedule.registry';
import { ScheduleService } from './runtime/schedule.service';

@Global()
@Module({
  providers: [ScheduleRegistry, ScheduleService, ScheduleLifecycle],
  exports: [ScheduleService],
})
export class ScheduleModule {}
