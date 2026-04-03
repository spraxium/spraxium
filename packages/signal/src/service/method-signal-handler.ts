import type { ZodType } from 'zod';
import type { SignalEnvelope, SignalHandler } from '../interfaces';

export class MethodSignalHandler implements SignalHandler {
  readonly event: string;
  readonly schema: ZodType | undefined;
  private readonly fn: (payload: unknown, envelope: SignalEnvelope) => Promise<void>;

  constructor(
    event: string,
    schema: ZodType | undefined,
    fn: (payload: unknown, envelope: SignalEnvelope) => Promise<void>,
  ) {
    this.event = event;
    this.schema = schema;
    this.fn = fn;
  }

  execute(payload: unknown, envelope: SignalEnvelope): Promise<void> {
    return this.fn(payload, envelope);
  }
}
