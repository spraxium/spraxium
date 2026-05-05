export interface RunOnceOptions {
  name?: string;
  disabled?: boolean;
  /** Optional human-readable description shown in `ScheduleService.getAll()`. */
  description?: string;
}
