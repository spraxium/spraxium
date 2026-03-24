export interface CronJobMetadata {
  expression: string;
  name?: string;
  runOnInit?: boolean;
  disabled?: boolean;
  timezone?: string;
}
