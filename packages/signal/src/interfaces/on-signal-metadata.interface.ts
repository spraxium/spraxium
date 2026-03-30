import type { ZodType } from 'zod';

export interface OnSignalMetadata {
  readonly event: string;
  readonly schema: ZodType | undefined;
}
