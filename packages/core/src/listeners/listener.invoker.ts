import type { BaseInteraction, Message } from 'discord.js';
import { ConfigStore } from '../config';
import { SpraxiumExecutionContext } from '../context';
import { ExceptionHandler, GuardDeniedException } from '../exceptions';
import { GuardExecutor } from '../guards';
import { logger } from '../logger';
import type { HandlerEntry } from './interfaces';

export class ListenerInvoker {
  public async runGroup(handlers: Array<HandlerEntry>, discordArgs: Array<unknown>): Promise<void> {
    for (const handler of handlers) {
      await this.run(handler, discordArgs);
    }
  }

  private async run(handler: HandlerEntry, discordArgs: Array<unknown>): Promise<void> {
    const handlerFn = this.resolveMethod(handler);
    if (!handlerFn) return;

    const firstArg = discordArgs[0];

    if (this.isInteractionOrMessage(firstArg)) {
      await this.runWithPipeline(handler, handlerFn, firstArg, discordArgs);
    } else {
      await this.runDirect(handler, handlerFn, discordArgs);
    }
  }

  private resolveMethod(handler: HandlerEntry): ((...args: Array<unknown>) => unknown) | null {
    const fn = (handler.instance as Record<string | symbol, unknown>)[handler.method];
    return typeof fn === 'function' ? (fn as (...args: Array<unknown>) => unknown) : null;
  }

  private async runWithPipeline(
    handler: HandlerEntry,
    handlerFn: (...args: Array<unknown>) => unknown,
    contextArg: BaseInteraction | Message,
    discordArgs: Array<unknown>,
  ): Promise<void> {
    const ctx = new SpraxiumExecutionContext(contextArg, handler.event);

    const passed = await GuardExecutor.execute(
      handler.ctor as new (
        ...args: Array<unknown>
      ) => unknown,
      handler.method,
      ctx,
    );
    if (!passed) {
      await ExceptionHandler.handle(new GuardDeniedException(), ctx, ConfigStore.getRaw().exceptions);
      return;
    }

    try {
      await Promise.resolve(handlerFn.call(handler.instance, ...discordArgs));
    } catch (err) {
      await ExceptionHandler.handle(err, ctx, ConfigStore.getRaw().exceptions);
    }
  }

  /** Direct call without any guard or exception pipeline. */
  private async runDirect(
    handler: HandlerEntry,
    handlerFn: (...args: Array<unknown>) => unknown,
    discordArgs: Array<unknown>,
  ): Promise<void> {
    try {
      await Promise.resolve(handlerFn.call(handler.instance, ...discordArgs));
    } catch (err) {
      logger.error(`[ListenerInvoker] Unhandled error in ${handler.ctor.name}.${String(handler.method)}`);
      if (err instanceof Error) logger.error(err.stack ?? err.message);
    }
  }

  private isInteractionOrMessage(value: unknown): value is BaseInteraction | Message {
    if (!value || typeof value !== 'object') return false;
    const obj = value as Record<string, unknown>;
    return (typeof obj.guildId === 'string' || obj.guildId === null) && typeof obj.channelId === 'string';
  }
}
