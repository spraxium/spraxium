import type { SignalEnvelope } from '../interfaces';

export type ValidationResult =
  | { readonly ok: true; readonly envelope: SignalEnvelope }
  | { readonly ok: false };
