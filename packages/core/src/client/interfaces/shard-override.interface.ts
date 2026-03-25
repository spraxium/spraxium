import type { ActivityOptions } from './activity-options.interface';
import type { PresenceOptions } from './presence-options.interface';

export type PresenceStatus = NonNullable<PresenceOptions['status']>;

export interface ShardOverride {
  status?: PresenceStatus;
  activities?: Array<ActivityOptions>;
  customProps?: Record<string, string | number | boolean | undefined>;
}
