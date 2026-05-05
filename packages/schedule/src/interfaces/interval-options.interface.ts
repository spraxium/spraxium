export interface IntervalOptions {
  name?: string;
  runOnInit?: boolean;
  disabled?: boolean;
  /** Optional human-readable description shown in `ScheduleService.getAll()`. */
  description?: string;
}
