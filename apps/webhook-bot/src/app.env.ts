import { Env, EnvSchema, SpraxiumBaseEnv } from '@spraxium/env';

@EnvSchema()
export class AppEnv extends SpraxiumBaseEnv {
  @Env('WEBHOOK_ALERTS', { secret: true })
  webhookAlerts: string;

  @Env('WEBHOOK_LOGS', { secret: true })
  webhookLogs: string;

  @Env('WEBHOOK_REPORTS', { secret: true })
  webhookReports: string;
}
