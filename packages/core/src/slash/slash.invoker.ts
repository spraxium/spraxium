import 'reflect-metadata';
import { type DeferOptions, METADATA_KEYS } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ConfigStore } from '../config';
import { SpraxiumExecutionContext } from '../context';
import { ExceptionHandler, GuardDeniedException } from '../exceptions';
import { GuardExecutor } from '../guards';
import { resolveOptionValue, resolveOptionsFromCommand } from './helpers';
import type { ResolvedSlashHandler } from './interfaces';
import type { SlashOptParam } from './types';

export class SlashInvoker {
  public async run(handler: ResolvedSlashHandler, interaction: ChatInputCommandInteraction): Promise<void> {
    const ctx = new SpraxiumExecutionContext(interaction, handler.config.name);

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

    const deferOptions = Reflect.getOwnMetadata(METADATA_KEYS.DEFER, handler.handlerCtor) as
      | DeferOptions
      | undefined;
    if (deferOptions) {
      await interaction.deferReply({ ephemeral: deferOptions.ephemeral ?? false });
    }

    try {
      const params = this.buildParams(handler, interaction);
      const fn = this.resolveMethod(handler);
      if (!fn) return;

      await Promise.resolve(fn.call(handler.instance, ...params));
    } catch (err) {
      await ExceptionHandler.handle(err, ctx, ConfigStore.getRaw().exceptions);
    }
  }

  private buildParams(
    handler: ResolvedSlashHandler,
    interaction: ChatInputCommandInteraction,
  ): Array<unknown> {
    const proto = handler.handlerCtor.prototype as object;

    const ctxIndex: number | undefined = Reflect.getOwnMetadata(METADATA_KEYS.CTX_PARAM, proto, 'handle');

    const optParamMap: Array<SlashOptParam> =
      Reflect.getMetadata(METADATA_KEYS.SLASH_OPT_PARAM, proto, 'handle') ?? [];

    const optionsByName = new Map(resolveOptionsFromCommand(handler).map((opt) => [opt.name, opt]));

    const paramTypes: Array<unknown> = Reflect.getMetadata('design:paramtypes', proto, 'handle') ?? [];
    const maxIndex = Math.max(
      paramTypes.length,
      ctxIndex !== undefined ? ctxIndex + 1 : 0,
      ...optParamMap.map((p) => p.index + 1),
    );

    const params: Array<unknown> = [];

    for (let i = 0; i < maxIndex; i++) {
      if (i === ctxIndex) {
        params.push(interaction);
      } else {
        const optParam = optParamMap.find((p) => p.index === i);
        if (optParam) {
          const meta = optionsByName.get(optParam.name);
          if (meta) {
            params.push(resolveOptionValue(interaction, optParam.name, meta.type));
          } else {
            params.push(null);
          }
        } else {
          params.push(undefined);
        }
      }
    }

    return params;
  }

  private resolveMethod(handler: ResolvedSlashHandler): ((...args: Array<unknown>) => unknown) | null {
    const fn = (handler.instance as Record<string, unknown>).handle;
    return typeof fn === 'function' ? (fn as (...args: Array<unknown>) => unknown) : null;
  }
}
