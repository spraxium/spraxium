import type { ZodType } from 'zod';
import type { SignalEnvelope } from './signal-envelope.interface';

export interface SignalHandler {
  readonly event: string;
  readonly schema: ZodType | undefined;
  execute(payload: unknown, envelope: SignalEnvelope): Promise<void>;
}
