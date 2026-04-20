import { z } from 'zod';

export const configUpdateSchema = z.object({
  key: z.string(),
  value: z.unknown(),
});

export const configResetSchema = z.object({
  scope: z.enum(['guild', 'global']),
});

export type ConfigUpdatePayload = z.infer<typeof configUpdateSchema>;
export type ConfigResetPayload = z.infer<typeof configResetSchema>;
