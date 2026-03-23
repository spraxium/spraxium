import type { SpraxiumGuard } from './spraxium-guard.interface';

export interface GuardEntry {
  guard: new () => SpraxiumGuard;
  options: Record<string, unknown>;
}