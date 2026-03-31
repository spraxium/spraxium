import type { ExecutionContext } from '@spraxium/common';
import type { BaseInteraction, Message } from 'discord.js';
import { logger } from '../logger';
import { InternalException } from './built-in';
import { DiscordReplyStrategy } from './discord-reply.strategy';
import type { ExceptionOptions } from './interfaces';
import { LayoutRegistry } from './layout.registry';
import { SpraxiumException } from './spraxium.exception';

/**
 * Central exception handler for the Spraxium interaction pipeline.
 *
 * Responsibilities (in order):
 *   1. Normalize any thrown value → SpraxiumException
 *   2. Log if `shouldLog` is true on the exception
 *   3. Resolve the correct layout via LayoutRegistry
 *   4. Build the Discord reply payload
 *   5. Send the reply via DiscordReplyStrategy
 *
 * Steps 3–5 are individually guarded , a layout/reply failure will never
 * propagate out or produce a secondary unhandled rejection.
 */
export class ExceptionHandler {
  /**
   * Handles a caught error from the command or guard pipeline.
   *
   * @param err      The raw caught value (any type).
   * @param ctx      The execution context active when the error was thrown.
   * @param options  User-configured exception options (layouts, logUnhandled).
   */
  public static async handle(err: unknown, ctx: ExecutionContext, options?: ExceptionOptions): Promise<void> {
    const exception = ExceptionHandler.normalize(err, options);

    if (exception.shouldLog) {
      ExceptionHandler.logException(exception, ctx);
    }

    if (!exception.shouldReply) return;

    try {
      const layout = LayoutRegistry.resolve(exception, options?.layouts);
      const payload = await Promise.resolve(layout.build(exception, ctx));
      const raw = ctx.getInteraction() as BaseInteraction | Message;
      await DiscordReplyStrategy.reply(raw, payload);
    } catch (layoutErr) {
      // Layout/reply failures must never cascade into the pipeline.
      logger.warn(
        `[ExceptionHandler] Failed to send exception reply: ${layoutErr instanceof Error ? layoutErr.message : String(layoutErr)}`,
      );
    }
  }

  /**
   * Normalizes any thrown value into a SpraxiumException.
   * Native SpraxiumExceptions pass through unchanged.
   * Everything else is wrapped in an InternalException.
   */
  private static normalize(err: unknown, options?: ExceptionOptions): SpraxiumException {
    if (err instanceof SpraxiumException) return err;

    const shouldLogUnhandled = options?.logUnhandled !== false;
    if (shouldLogUnhandled) {
      const msg = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? (err.stack ?? '') : '';
      logger.error(`[UNHANDLED] ${msg}`);
      if (stack) logger.error(stack);
    }

    const cause = err instanceof Error ? err.message : String(err);
    return new InternalException({ cause });
  }

  private static logException(exception: SpraxiumException, ctx: ExecutionContext): void {
    const command = ctx.getCommandName();
    logger.error(`[${exception.code}] ${exception.name} in "${command}": ${exception.message}`);
    if (exception.stack) logger.error(exception.stack);
  }
}
