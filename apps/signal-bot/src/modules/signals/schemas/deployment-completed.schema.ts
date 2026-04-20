import { z } from 'zod';

export const deployCompletedSchema = z.object({
  version: z.string(),
  environment: z.enum(['development', 'staging', 'production']),
  deployedBy: z.string().optional(),
});

export type DeployCompletedPayload = z.infer<typeof deployCompletedSchema>;
