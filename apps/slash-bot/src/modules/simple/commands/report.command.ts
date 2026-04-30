import { SlashCommand } from '@spraxium/common';

@SlashCommand({ name: 'report', description: 'Generates a full server report (simulates heavy processing).' })
export class ReportCommand {}
