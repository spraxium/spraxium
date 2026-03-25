import { ActivityType } from 'discord.js';
import type { ActivityOptions } from '../interfaces';

export const ACTIVITY_TYPE_MAP: Record<ActivityOptions['type'], ActivityType> = {
  Playing: ActivityType.Playing,
  Streaming: ActivityType.Streaming,
  Listening: ActivityType.Listening,
  Watching: ActivityType.Watching,
  Competing: ActivityType.Competing,
};
