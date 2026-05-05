import { SlashCommand } from '@spraxium/common';

@SlashCommand({
  name: 'stats',
  description: 'View server statistics.',
})
export class StatsCommand {}
