# @spraxium/schedule

`@spraxium/schedule` brings cron-based job scheduling to Spraxium bots through a decorator API. Annotate any injectable method with `@Cron`, `@Interval`, or `@Timeout`, and the scheduler starts the job automatically once the bot is online. Jobs support standard 5-field and 6-field cron expressions with an optional seconds field, per-job IANA timezone overrides, immediate execution on startup via `runOnInit`, and soft-disabling through the `disabled` option so you can ship a job without activating it.

For distributed or sharded bots, the package ships a `RedisScheduleDriver` that uses a distributed lock to guarantee that exactly one instance executes a given job at a time across the whole cluster. The default `MemoryDriver` works for single-process bots with no extra dependencies. The `ScheduleService` is injectable as well, letting you pause, resume, and destroy named jobs programmatically at runtime without modifying the class or redeploying.

## Installation

```bash
npm install @spraxium/schedule
```

## Usage

```typescript
import { Injectable } from '@spraxium/common';
import { AfterOnline, Cron, CronExpression, Interval, IntervalExpression, RunOnce, Timeout } from '@spraxium/schedule';

@Injectable()
export class TaskService {
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timezone: 'America/Sao_Paulo' })
  async dailyCleanup(): Promise<void> {
    // runs every day at midnight in the configured timezone
  }

  @Interval(IntervalExpression.EVERY_MINUTE)
  async heartbeat(): Promise<void> {
    // runs every 60 seconds
  }

  @Timeout(5_000)
  async warmup(): Promise<void> {
    // runs once, 5 seconds after the bot boots
  }

  @AfterOnline(0)
  async onReady(): Promise<void> {
    // runs once, immediately after the Discord ready event fires
  }

  @RunOnce(new Date('2026-12-31T23:00:00Z'))
  async sendNewYearPing(): Promise<void> {
    // runs exactly once at the specified date
  }
}
```

```typescript
// app.module.ts
import { Module } from '@spraxium/common';
import { ScheduleModule } from '@spraxium/schedule';
import { TaskService } from './task.service';

@Module({
  imports: [ScheduleModule],
  providers: [TaskService],
})
export class AppModule {}
```

### Lock guarantees

The Redis lock is mutual exclusion, not per-occurrence deduplication. Each acquisition gets its own ownership token and only that owner can release it, so an invocation that outlives its TTL cannot release a lease acquired after it expired. The lock is released as soon as the job finishes, so a replica whose timer fires later can still run the same occurrence. Jobs whose side effects must happen exactly once should remain idempotent. Lock acquisition or release failures are logged and never surface as unhandled rejections.

## Links

[npm](https://www.npmjs.com/package/@spraxium/schedule) · [GitHub](https://github.com/spraxium/spraxium) · [node-cron](https://github.com/node-cron/node-cron) · [Documentation](https://spraxium.com)

## License

Apache 2.0
