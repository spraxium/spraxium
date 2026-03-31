import { Guard } from '@spraxium/common';
import type { ExecutionContext, SpraxiumGuard } from '@spraxium/common';

/**
 * Blocks invocations from bot accounts.
 * Works with all interaction types and Message-based handlers.
 *
 * @example , per handler:
 *   @UseGuards(NoBotGuard)
 *   export class EchoPrefixHandler { ... }
 *
 * @example , global:
 *   app.useGlobalGuards(NoBotGuard);
 */
@Guard()
export class NoBotGuard implements SpraxiumGuard {
  public canActivate(ctx: ExecutionContext): boolean {
    return !ctx.getUser().bot;
  }
}
