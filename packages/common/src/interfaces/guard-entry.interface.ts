import type { SpraxiumGuard } from './spraxium-guard.interface';

export interface GuardEntry {
  guard: new (...args: Array<never>) => SpraxiumGuard;
  options: Record<string, unknown>;
}
