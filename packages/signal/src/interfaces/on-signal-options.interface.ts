import type { ZodType } from 'zod';

/**
 * Options for the `@OnSignal()` decorator.
 */
export interface OnSignalOptions {
  /**
   * Zod schema used to validate the incoming payload.
   * If provided and the payload fails validation, the signal is silently dropped.
   */
  schema?: ZodType;
}
