import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import { GuardExecutor } from '@spraxium/core';
import {
  type AnySelectMenuInteraction,
  type Client,
  Events,
  type Interaction,
  type StringSelectMenuInteraction,
} from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type {
  DynamicSelectComponentMeta,
  DynamicSelectHandlerMeta,
  SelectComponentMeta,
  SelectHandlerMeta,
} from '../../../components/select';
import { ContextStore } from '../../context';
import { ComponentExecutionContext } from '../../guards';
import type { ComponentsConfig, SpraxiumContext } from '../../lifecycle';
import { PayloadService } from '../../payload';
import { resolveContextError } from '../helpers/context-error.helper';
import { reportHandlerError } from '../helpers/handler-error.helper';
import { splitCustomId } from '../helpers/split-custom-id.helper';
import type { Constructor, ResolvedDynamicSelectHandler, ResolvedSelectHandler } from '../interfaces';

/**
 * Handles registration and dispatch of select menu interactions.
 * Supports all static select menu types (string, user, role, mentionable, channel)
 * and `@DynamicStringSelect` payload-aware selects.
 */
export class SelectDispatcher {
  private readonly handlers: Array<ResolvedSelectHandler> = [];
  private readonly dynamicHandlers: Array<ResolvedDynamicSelectHandler> = [];
  private config?: ComponentsConfig;
  private payloads = new PayloadService();

  setConfig(config: ComponentsConfig): void {
    this.config = config;
  }

  get size(): number {
    return this.handlers.length + this.dynamicHandlers.length;
  }

  register(ctor: Constructor, instance: unknown): void {
    const handlerMeta: SelectHandlerMeta | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.SELECT_HANDLER,
      ctor,
    );
    if (handlerMeta) {
      const componentClass = handlerMeta.component as Constructor;
      const componentMeta: SelectComponentMeta | undefined = Reflect.getMetadata(
        COMPONENT_METADATA_KEYS.SELECT_COMPONENT,
        componentClass,
      );
      if (!componentMeta) {
        throw new Error(
          `${ctor.name}: select handler references ${componentClass.name} which is not decorated with a select decorator.`,
        );
      }
      this.assertNoCollision(componentMeta.customId);
      this.handlers.push({
        customId: componentMeta.customId,
        handlerCtor: ctor,
        handlerInstance: instance,
      });
      return;
    }

    const dynMeta: DynamicSelectHandlerMeta | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.SELECT_DYNAMIC_HANDLER,
      ctor,
    );
    if (dynMeta) {
      const componentClass = dynMeta.component as Constructor;
      const dyn: DynamicSelectComponentMeta | undefined = Reflect.getMetadata(
        COMPONENT_METADATA_KEYS.SELECT_DYNAMIC,
        componentClass,
      );
      if (!dyn) {
        throw new Error(
          `${ctor.name}: @DynamicSelectHandler references ${componentClass.name} which is not decorated with @DynamicStringSelect().`,
        );
      }
      this.assertNoCollision(dyn.baseId);
      this.dynamicHandlers.push({ baseId: dyn.baseId, handlerCtor: ctor, handlerInstance: instance });
    }
  }

  bind(client: Client): void {
    if (this.handlers.length === 0 && this.dynamicHandlers.length === 0) return;

    client.on(Events.InteractionCreate, (interaction: Interaction) => {
      if (
        !interaction.isStringSelectMenu() &&
        !interaction.isUserSelectMenu() &&
        !interaction.isRoleSelectMenu() &&
        !interaction.isMentionableSelectMenu() &&
        !interaction.isChannelSelectMenu()
      )
        return;

      const select = interaction as AnySelectMenuInteraction;
      const { baseId, contextId, payloadId } = splitCustomId(select.customId);

      const resolved = this.handlers.find((h) => h.customId === baseId);
      if (resolved) {
        void this.handleStatic(select, resolved, contextId);
        return;
      }

      const dynResolved = this.dynamicHandlers.find((h) => h.baseId === baseId);
      if (dynResolved && select.isStringSelectMenu()) {
        void this.handleDynamic(select, dynResolved, contextId, payloadId);
      }
    });
  }

  private async handleStatic(
    select: AnySelectMenuInteraction,
    resolved: ResolvedSelectHandler,
    contextId: string | undefined,
  ): Promise<void> {
    const handlerName = `select handler ${resolved.handlerCtor.name}`;
    try {
      const flowCtx = await this.resolveFlowContext(select, contextId);
      if (flowCtx === null) return;

      const guardPassed = await GuardExecutor.execute(
        resolved.handlerCtor,
        'handle',
        new ComponentExecutionContext(select, resolved.customId),
      );
      if (!guardPassed) return;

      const args = this.buildArgs(resolved, select, flowCtx, undefined);
      await this.invoke(resolved.handlerInstance, args);
    } catch (err) {
      await this.reportError(err, select, handlerName);
    }
  }

  private async handleDynamic(
    select: StringSelectMenuInteraction,
    resolved: ResolvedDynamicSelectHandler,
    contextId: string | undefined,
    payloadId: string | undefined,
  ): Promise<void> {
    const handlerName = `@DynamicSelectHandler(${resolved.handlerCtor.name})`;
    try {
      const flowCtx = await this.resolveFlowContext(select, contextId);
      if (flowCtx === null) return;

      let payload: unknown;
      if (payloadId) {
        payload = await this.payloads.get(payloadId);
        if (payload === undefined) {
          const ephemeral = this.config?.select?.ephemeralErrors !== false;
          await select.reply(
            resolveContextError(
              this.config?.errorMessages?.payloadExpired,
              '❌ This action has expired.',
              ephemeral,
            ),
          );
          return;
        }
      }

      const guardPassed = await GuardExecutor.execute(
        resolved.handlerCtor,
        'handle',
        new ComponentExecutionContext(select, resolved.baseId),
      );
      if (!guardPassed) return;

      const args = this.buildArgs(resolved, select, flowCtx, payload, payloadId);
      await this.invoke(resolved.handlerInstance, args);
    } catch (err) {
      await this.reportError(err, select, handlerName);
    }
  }

  private buildArgs(
    resolved: ResolvedSelectHandler | ResolvedDynamicSelectHandler,
    select: AnySelectMenuInteraction,
    flowCtx: SpraxiumContext<unknown> | undefined,
    payload: unknown,
    payloadId?: string,
  ): Array<unknown> {
    const proto = resolved.handlerCtor.prototype as Record<string | symbol, unknown>;
    const ctxIndex: number | undefined = Reflect.getMetadata(METADATA_KEYS.CTX_PARAM, proto, 'handle');
    const selectedValuesIndices: Array<number> =
      Reflect.getMetadata(COMPONENT_METADATA_KEYS.SELECT_SELECTED_VALUES_PARAM, proto, 'handle') ?? [];
    const flowCtxIndex: number | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.FLOW_CONTEXT_PARAM,
      proto,
      'handle',
    );
    const payloadIndex: number | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.SELECT_PAYLOAD_PARAM,
      proto,
      'handle',
    );
    const payloadRefIndex: number | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.PAYLOAD_REF_PARAM,
      proto,
      'handle',
    );

    const args: Array<unknown> = [];
    if (ctxIndex !== undefined) args[ctxIndex] = select;
    for (const idx of selectedValuesIndices) args[idx] = select.values;
    if (flowCtxIndex !== undefined) args[flowCtxIndex] = flowCtx;
    if (payloadIndex !== undefined) args[payloadIndex] = payload;
    if (payloadRefIndex !== undefined && payloadId !== undefined) {
      args[payloadRefIndex] = {
        id: payloadId,
        consume: () => this.payloads.delete(payloadId),
      };
    }
    return args;
  }

  private async invoke(instance: unknown, args: Array<unknown>): Promise<void> {
    const fn = (instance as Record<string | symbol, (...a: Array<unknown>) => unknown>).handle;
    if (typeof fn !== 'function') return;
    await Promise.resolve(fn.call(instance, ...args));
  }

  private async resolveFlowContext(
    interaction: AnySelectMenuInteraction,
    contextId: string | undefined,
  ): Promise<SpraxiumContext<unknown> | undefined | null> {
    if (!contextId) return undefined;

    const ephemeral = this.config?.select?.ephemeralErrors !== false;

    const flowCtx = await ContextStore.get(contextId);
    if (!flowCtx) {
      await interaction.reply(
        resolveContextError(
          this.config?.errorMessages?.expired,
          '❌ This interaction has expired.',
          ephemeral,
        ),
      );
      return null;
    }
    if (flowCtx.restrictedTo && flowCtx.restrictedTo !== interaction.user.id) {
      await interaction.reply(
        resolveContextError(
          this.config?.errorMessages?.restricted,
          '❌ You are not allowed to use this component.',
          ephemeral,
        ),
      );
      return null;
    }
    return flowCtx;
  }

  private async reportError(err: unknown, interaction: Interaction, handler: string): Promise<void> {
    await reportHandlerError(
      err,
      interaction,
      handler,
      this.config,
      this.config?.select?.ephemeralErrors !== false,
      this.config?.select?.onErrorReply,
    );
  }

  private assertNoCollision(id: string): void {
    const isStatic = this.handlers.some((h) => h.customId === id);
    const isDynamic = this.dynamicHandlers.some((h) => h.baseId === id);
    if (isStatic || isDynamic) {
      console.warn(
        `[Spraxium] Select customId / baseId collision detected for "${id}". Two handlers cannot share the same identifier — only the first registered will fire.`,
      );
    }
  }
}
