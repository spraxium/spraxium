export { SignalModule } from './signal.module';
export { defineSignal } from './signal.config';
export { OnSignal, SignalListener } from './decorators';
export { createSignalPayload } from './helpers';

export type { OnSignalOptions, SignalConfig, SignalEnvelope, SignalHandler } from './interfaces';
export type { UnsignedEnvelope, ValidationResult } from './types';
