export interface CronOptions {
  name?: string;
  runOnInit?: boolean;
  disabled?: boolean;
  timezone?: string;
  /** Optional human-readable description shown in `ScheduleService.getAll()`. */
  description?: string;
}
