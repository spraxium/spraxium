import type { SignalEnvelope } from '../interfaces';

export type UnsignedEnvelope = Omit<SignalEnvelope, 'signature'>;
