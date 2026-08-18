import { DocumentDefinition, JsonDocument } from '@spraxium/storage-json';
import { z } from 'zod';

export const demoStatsSchema = z.object({
  version: z.literal(1),
  bootCount: z.number(),
  commandCount: z.number(),
  lastBootAt: z.string().optional(),
});

export type DemoStats = z.infer<typeof demoStatsSchema>;

export function createDemoStats(): DemoStats {
  return {
    version: 1,
    bootCount: 0,
    commandCount: 0,
  };
}

export function isDemoStats(value: unknown): value is DemoStats {
  return demoStatsSchema.safeParse(value).success;
}

@JsonDocument({
  name: 'demo-stats',
  defaults: createDemoStats,
  schema: demoStatsSchema,
})
export class DemoStatsDocument extends DocumentDefinition<DemoStats> {}
