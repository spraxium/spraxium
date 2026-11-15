# @spraxium/schedule

`@spraxium/schedule` schedules methods on providers, handlers and listeners instantiated by Spraxium. Import `ScheduleModule` and decorate instance methods with `@Cron`, `@Interval`, `@Timeout`, `@AfterOnline` or `@RunOnce`. Inherited methods and symbol methods are supported. An undecorated override removes the inherited schedule. Each method accepts one schedule decorator.

The default `MemoryDriver` prevents overlapping executions within one process. For multiple processes or shards, `RedisScheduleDriver` adds a renewable distributed lease. Handlers should be idempotent: distributed leases coordinate concurrent owners and do not provide exactly-once delivery or deduplicate every occurrence across processes.

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
  }

  @Interval(IntervalExpression.EVERY_MINUTE)
  async heartbeat(): Promise<void> {
  }

  @Timeout(5_000)
  async warmup(): Promise<void> {
  }

  @AfterOnline(0)
  async onReady(): Promise<void> {
  }

  @RunOnce(new Date('2026-12-31T23:00:00Z'))
  async sendNewYearPing(): Promise<void> {
  }
}
```

```typescript
import { Module } from '@spraxium/common';
import { ScheduleModule } from '@spraxium/schedule';
import { TaskService } from './task.service';

@Module({
  imports: [ScheduleModule],
  providers: [TaskService],
})
export class AppModule {}
```

## Timing and lifecycle

| Decorator | First scheduled attempt |
| --- | --- |
| `@Cron(expression)` | Next calendar match after schedule initialization during `onBoot` |
| `@Interval(ms)` | `ms` milliseconds after schedule initialization |
| `@Timeout(ms)` | One attempt after `ms` milliseconds from schedule initialization |
| `@AfterOnline(ms)` | One attempt after `ms` milliseconds from the first ready hook |
| `@RunOnce(date)` | One attempt at an absolute future date |

Only `@AfterOnline` waits for Discord to be ready. `runOnInit` on cron and interval jobs adds an immediate attempt during schedule initialization. Repeated boot or ready hooks do not duplicate timers. Providers imported before `ScheduleModule` are discovered too. Discovery is scoped to each application loader, so separate applications in one process do not register each other's jobs. This behavior requires the corresponding core update.

Delays must be safe integers within the JavaScript Date range. Intervals must be positive; timeout and after-online delays may be zero. Long delays are split into timers below Node.js's maximum timer delay. Timers are not a real-time guarantee: event loop delays can postpone execution. Interval ticks remain anchored, skip overlaps and do not queue missed executions. Cron scheduling uses `cron-parser` with five or six fields and an optional IANA timezone. A job timezone overrides the global timezone; without either, the process timezone is used.

`CronExpression.EVERY_LAST_DAY_OF_MONTH` uses the calendar's actual last day, including leap years. Cron steps operate inside their calendar fields: `EVERY_45_MINUTES` matches minute 0 and 45 of each hour. Use `IntervalExpression.EVERY_45_MINUTES` for a constant 45-minute duration.

A `RunOnce` date that is already past at initialization remains registered without an automatic timer and emits a warning. An explicit `runNow` can still execute it. One-shot jobs are removed after their scheduled attempt, including when another process holds the lock or the handler fails. There is no automatic retry or persistent job queue.

## Runtime control

Inject `ScheduleService` to use `get`, `getAll`, `pause`, `resume`, `destroy` and `runNow`. Status dates are copies; `running` means automatic scheduling is active, including a one-shot attempt in progress. `executing` includes lock acquisition and handler execution. `runCount` counts handler attempts, including failures, and `lastRun` records when the handler started.

Give distributed jobs an explicit, stable `name`, shared by all replicas. The default name is `<type>-<Class>.<method>`; renaming or minifying a class changes it. Duplicate names are rejected. Multiple instances of a class need distinct explicit names when they represent distinct jobs.

`pause` cancels future automatic attempts without interrupting an active handler. `resume` starts a fresh countdown or finds the next cron date; it does not repeat `runOnInit`. `runNow` can execute a paused job, and executing a one-shot job manually consumes it. `destroy` unregisters the job and cancels pending attempts. A job with `disabled: true`, or all jobs under `disableAll`, ignores resume and manual execution. Manual execution also requires initialization, and after-online jobs require ready.

Shutdown cancels future attempts, waits for acquired or pending executions to settle, releases their locks and then destroys the driver. Handlers and custom drivers must settle their promises for shutdown to finish. An active handler must not await shutdown of its own scheduler, which would wait for that handler.

## Redis and configuration

Install the optional peer `ioredis` in applications using Redis:

```bash
pnpm add ioredis
```

Add schedule settings to the application's existing plugin configuration:

```typescript
import { defineSchedule, RedisScheduleDriver } from '@spraxium/schedule';

const schedule = defineSchedule({
  timezone: 'America/Sao_Paulo',
  defaultLockTtlMs: 60_000,
  driver: new RedisScheduleDriver({
    host: '127.0.0.1',
    port: 6379,
    keyPrefix: 'my-bot:schedule:',
  }),
});
```

Use a separate key prefix for independent applications and the same prefix for replicas coordinating the same jobs. Redis locks use millisecond TTLs and a unique token per acquisition. Release and renewal compare that token atomically. The scheduler renews supported leases every third of `defaultLockTtlMs` while the handler is active. Custom drivers can implement optional `renewLock`; existing drivers without it remain supported. Local memory locks last until release and do not require renewal.

Redis commands fail while offline instead of accumulating in an offline queue. Connection retries per command default to 1; an explicit `maxRetriesPerRequest: null` retains ioredis's unbounded behavior. Connection or lock failures are logged or reported during boot. Renewal failure is logged and renewal stops. A running handler cannot be forcibly interrupted, so a network partition or an event loop stall longer than the lease can still permit another process to run. For effects that require deduplication, enforce an idempotency key in durable application storage.

## Testing without timers

`ScheduleTester.discover(ClassOrInstance)` shares runtime discovery rules. `ScheduleTester.runAll(instance, type?)` invokes enabled scheduled methods directly, without boot, timers or locks. `ScheduleTester.run(instance, methodName)` invokes the requested method explicitly, including a disabled method, and supports symbols. Handler failures are propagated to the test caller.

## Links

[npm](https://www.npmjs.com/package/@spraxium/schedule) · [GitHub](https://github.com/spraxium/spraxium) · [cron-parser](https://github.com/harrisiirak/cron-parser) · [Documentation](https://spraxium.com)

## License

Apache 2.0
