export const MESSAGES = {
  CRON_INVALID_EXPRESSION: (expression: string, reason: string) =>
    `"${expression}" is not a valid cron expression \u2014 ${reason}`,
  CRON_REGISTERED: (name: string, expression: string, timezone?: string) =>
    `Registered cron job "${name}" \u2014 ${expression}${timezone ? ` (${timezone})` : ''}`,

  INTERVAL_NEGATIVE_MS: (ms: number) => `@Interval requires a positive millisecond value, got ${ms}`,
  INTERVAL_REGISTERED: (name: string, ms: number) => `Registered interval job "${name}" \u2014 every ${ms}ms`,

  TIMEOUT_NEGATIVE_MS: (ms: number) => `@Timeout requires a non-negative millisecond value, got ${ms}`,
  TIMEOUT_REGISTERED: (name: string, ms: number) =>
    `Registered timeout job "${name}" \u2014 fires in ${ms}ms`,

  AFTER_ONLINE_NEGATIVE_MS: (ms: number) =>
    `@AfterOnline requires a non-negative millisecond value, got ${ms}`,
  AFTER_ONLINE_REGISTERED: (name: string, ms: number) =>
    `Registered after-online job "${name}" \u2014 fires ${ms}ms after online`,

  RUN_ONCE_REGISTERED: (name: string, date: string) => `Registered run-once job "${name}" - fires at ${date}`,

  DUPLICATE_JOB_NAME: (name: string) =>
    `Duplicate job name "${name}" \u2014 job names must be unique across the module tree.`,
  METHOD_NOT_FUNCTION: (method: string, className: string, jobName: string) =>
    `"${method}" on ${className} is not a function (job "${jobName}")`,

  JOB_PAUSED: (name: string) => `Job "${name}" paused`,
  JOB_RESUMED: (name: string) => `Job "${name}" resumed`,
  JOB_DESTROYED: (name: string) => `Job "${name}" destroyed`,

  JOB_NOT_FOUND_PAUSE: (name: string) => `Cannot pause: no job named "${name}"`,
  JOB_NOT_FOUND_RESUME: (name: string) => `Cannot resume: no job named "${name}"`,
  JOB_NOT_FOUND_DESTROY: (name: string) => `Cannot destroy: no job named "${name}"`,
  JOB_NOT_FOUND_RUN_NOW: (name: string) => `Cannot runNow: no job named "${name}"`,

  JOB_LOCK_SKIPPED: (name: string) => `Job "${name}" skipped \u2014 lock held by another process`,
  JOB_ERROR: (name: string, type: string, detail: string) =>
    `Unhandled error in scheduled job "${name}" (${type}) \u2014 ${detail}`,

  TESTER_NOT_A_METHOD: (methodName: string, className: string) =>
    `ScheduleTester.run: "${methodName}" is not a method on ${className}. Did you spell it correctly?`,

  SCHEDULE_DISABLED: 'All scheduled jobs are disabled \u2014 disableAll is set to true in config',
} as const;
