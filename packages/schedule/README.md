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
import { Cron, CronExpression, Interval, Timeout } from '@spraxium/schedule';

@Injectable()
export class TaskService {
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timezone: 'America/Sao_Paulo' })
  async dailyCleanup(): Promise<void> {
    // runs every day at midnight in the configured timezone
  }

  @Interval(60_000)
  async heartbeat(): Promise<void> {
    // runs every 60 seconds
  }

  @Timeout(5_000)
  async onceOnStartup(): Promise<void> {
    // runs once, 5 seconds after the bot goes online
  }
}
```

## Links

[npm](https://www.npmjs.com/package/@spraxium/schedule) · [GitHub](https://github.com/spraxium/spraxium) · [node-cron](https://github.com/node-cron/node-cron) · [Documentation](https://spraxium.com)

## License

Apache 2.0
