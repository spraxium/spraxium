import type { ExecutionContext } from './execution-context.interface';

/**
 * Every guard must implement this interface.
 * Return (or resolve to) true to allow the command, false to block it.
 */
export interface SpraxiumGuard {
  canActivate(ctx: ExecutionContext): Promise<boolean> | boolean;
}