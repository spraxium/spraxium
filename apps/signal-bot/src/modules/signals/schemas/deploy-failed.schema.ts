import { z } from 'zod';

export const deployFailedSchema = z.object({
  version: z.string(),
  reason: z.string(),
});

export type DeployFailedPayload = z.infer<typeof deployFailedSchema>;
