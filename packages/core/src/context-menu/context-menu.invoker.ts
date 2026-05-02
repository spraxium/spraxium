import 'reflect-metadata';
import { type AutoDeferOptions, type DeferOptions, METADATA_KEYS } from '@spraxium/common';
import type { ContextMenuCommandInteraction } from 'discord.js';
import { ConfigStore } from '../config';
import { SpraxiumExecutionContext } from '../context';
import { ExceptionHandler, GuardDeniedException } from '../exceptions';
import { GuardExecutor } from '../guards';
import { installAutoDefer } from '../utils/auto-defer.util';
import type { ResolvedContextMenuHandler } from './interfaces';

export class ContextMenuInvoker {
  public async run(
    handler: ResolvedContextMenuHandler,
    interaction: ContextMenuCommandInteraction,
  ): Promise<void> {
    const ctx = new SpraxiumExecutionContext(interaction, handler.config.name);

    const deferOptions = Reflect.getOwnMetadata(METADATA_KEYS.DEFER, handler.handlerCtor) as
      | DeferOptions
      | undefined;
    const autoDeferOptions = Reflect.getOwnMetadata(METADATA_KEYS.AUTO_DEFER, handler.handlerCtor) as
      | AutoDeferOptions
      | undefined;

    let cleanupAutoDefer: (() => void) | undefined;

    try {
      const passed = await GuardExecutor.execute(
        handler.handlerCtor as new (
          ...args: Array<unknown>
        ) => unknown,
        'handle',
        ctx,
      );
      if (!passed) {
        await ExceptionHandler.handle(new GuardDeniedException(), ctx, ConfigStore.getRaw().exceptions);
        return;
      }

      if (deferOptions) {
        await interaction.deferReply({ ephemeral: deferOptions.ephemeral ?? false });
      }

      cleanupAutoDefer = autoDeferOptions ? installAutoDefer(interaction, autoDeferOptions) : undefined;
      const params = this.buildParams(handler, interaction);
      const fn = (handler.instance as Record<string, unknown>).handle;
      if (typeof fn !== 'function') return;

      await Promise.resolve((fn as (...args: Array<unknown>) => unknown).call(handler.instance, ...params));
    } catch (err) {
      await ExceptionHandler.handle(err, ctx, ConfigStore.getRaw().exceptions);
    } finally {
      cleanupAutoDefer?.();
    }
  }

  private buildParams(
    handler: ResolvedContextMenuHandler,
    interaction: ContextMenuCommandInteraction,
  ): Array<unknown> {
    const proto = handler.handlerCtor.prototype as object;
    const ctxIndex: number | undefined = Reflect.getOwnMetadata(METADATA_KEYS.CTX_PARAM, proto, 'handle');

    const paramTypes: Array<unknown> = Reflect.getMetadata('design:paramtypes', proto, 'handle') ?? [];
    const maxIndex = Math.max(paramTypes.length, ctxIndex !== undefined ? ctxIndex + 1 : 0);

    const params: Array<unknown> = [];
    for (let i = 0; i < maxIndex; i++) {
      params.push(i === ctxIndex ? interaction : undefined);
    }

    return params;
  }
}
