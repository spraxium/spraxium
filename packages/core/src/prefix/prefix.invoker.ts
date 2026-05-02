import 'reflect-metadata';
import { METADATA_KEYS, type PrefixArgMetadata, type PrefixConfig } from '@spraxium/common';
import type { Message } from 'discord.js';
import { ConfigStore } from '../config';
import { SpraxiumExecutionContext } from '../context';
import { CooldownException, ExceptionHandler, GuardDeniedException } from '../exceptions';
import { GuardExecutor } from '../guards';
import type { ResolvedPrefixHandler } from './interfaces';
import { PrefixArgParser } from './parsers';
import { PrefixCooldownManager } from './prefix-cooldown.manager';

export class PrefixInvoker {
  private readonly argParser = new PrefixArgParser();
  public readonly cooldowns = new PrefixCooldownManager();

  public async run(
    handler: ResolvedPrefixHandler,
    message: Message,
    argv: Array<string>,
    config: PrefixConfig,
    argMetas: Array<PrefixArgMetadata>,
  ): Promise<void> {
    const commandConfig = handler.command.config;
    const commandName = commandConfig.name;
    const ctx = new SpraxiumExecutionContext(message, commandName);

    const cooldownSeconds = commandConfig.cooldown ?? config.defaultCooldown ?? 0;
    if (cooldownSeconds > 0) {
      const remaining = this.cooldowns.check(commandName, message.author.id);
      if (remaining > 0) {
        await ExceptionHandler.handle(
          new CooldownException({ seconds: remaining, command: commandName }),
          ctx,
          ConfigStore.getRaw().exceptions,
        );
        return;
      }
    }

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

      const coercedArgs = this.argParser.parse(argv, argMetas, message);
      const params = this.buildParams(handler, message, coercedArgs, argMetas);
      const fn = this.resolveMethod(handler);
      if (!fn) return;

      await Promise.resolve(fn.call(handler.instance, ...params));

      if (cooldownSeconds > 0) {
        this.cooldowns.set(commandName, message.author.id, cooldownSeconds);
      }
    } catch (err) {
      await ExceptionHandler.handle(err, ctx, ConfigStore.getRaw().exceptions);
    }
  }

  private buildParams(
    handler: ResolvedPrefixHandler,
    message: Message,
    coercedArgs: Map<string, unknown>,
    _argMetas: Array<PrefixArgMetadata>,
  ): Array<unknown> {
    const proto = handler.handlerCtor.prototype as object;
    const ctxIndex: number | undefined = Reflect.getOwnMetadata(METADATA_KEYS.CTX_PARAM, proto, 'handle');

    const argParamMap: Map<number, string> =
      Reflect.getOwnMetadata(METADATA_KEYS.PREFIX_ARG_PARAM, proto, 'handle') ?? new Map<number, string>();

    const paramTypes: Array<unknown> = Reflect.getMetadata('design:paramtypes', proto, 'handle') ?? [];
    const maxIndex = Math.max(
      paramTypes.length,
      ctxIndex !== undefined ? ctxIndex + 1 : 0,
      ...Array.from(argParamMap.keys()).map((i) => i + 1),
    );

    const params: Array<unknown> = [];

    for (let i = 0; i < maxIndex; i++) {
      if (i === ctxIndex) {
        params.push(message);
      } else if (argParamMap.has(i)) {
        const argName = argParamMap.get(i) as string;
        params.push(coercedArgs.get(argName));
      } else {
        params.push(undefined);
      }
    }

    return params;
  }

  private resolveMethod(handler: ResolvedPrefixHandler): ((...args: Array<unknown>) => unknown) | null {
    const fn = (handler.instance as Record<string, unknown>).handle;
    return typeof fn === 'function' ? (fn as (...args: Array<unknown>) => unknown) : null;
  }
}
