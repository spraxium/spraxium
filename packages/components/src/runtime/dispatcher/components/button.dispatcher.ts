import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import { GuardExecutor } from '@spraxium/core';
import { logger } from '@spraxium/logger';
import { type ButtonInteraction, type Client, Events, type Interaction } from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type {
  ButtonComponentMeta,
  ButtonHandlerMeta,
  DynamicButtonComponentMeta,
  DynamicButtonHandlerMeta,
} from '../../../components/button';
import { ContextStore } from '../../context';
import { ComponentExecutionContext } from '../../guards';
import type { ComponentsConfig, SpraxiumContext } from '../../lifecycle';
import { PayloadService } from '../../payload';
import { resolveContextError } from '../helpers/context-error.helper';
import { reportHandlerError } from '../helpers/handler-error.helper';
import { splitCustomId } from '../helpers/split-custom-id.helper';
import type { Constructor, ResolvedButtonHandler, ResolvedDynamicButtonHandler } from '../interfaces';

export class ButtonDispatcher {
  private readonly log = logger.child('ButtonDispatcher');
  private readonly staticHandlers: Array<ResolvedButtonHandler> = [];
  private readonly dynamicHandlers: Array<ResolvedDynamicButtonHandler> = [];
  private config?: ComponentsConfig;
  private payloads = new PayloadService();

  setConfig(config: ComponentsConfig): void {
    this.config = config;
  }

  get size(): number {
    return this.staticHandlers.length + this.dynamicHandlers.length;
  }

  registerStatic(ctor: Constructor, instance: unknown): void {
    const handlerMeta: ButtonHandlerMeta | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.BUTTON_HANDLER,
      ctor,
    );
    if (handlerMeta) {
      const componentClass = handlerMeta.component as Constructor;
      const componentMeta: ButtonComponentMeta | undefined = Reflect.getMetadata(
        COMPONENT_METADATA_KEYS.BUTTON_COMPONENT,
        componentClass,
      );
      if (!componentMeta) {
        throw new Error(
          `${ctor.name}: @ButtonHandler references ${componentClass.name} which is not decorated with @Button().`,
        );
      }
      if (componentMeta.isLink) {
        throw new Error(
          `${ctor.name}: @ButtonHandler references ${componentClass.name} which is a @LinkButton; link buttons do not fire interactions.`,
        );
      }

      const customId = (componentMeta as ButtonComponentMeta & { customId: string }).customId;
      this.assertNoCollision(customId);
      this.staticHandlers.push({ customId, handlerCtor: ctor, handlerInstance: instance });
      return;
    }

    const dynamicMeta: DynamicButtonHandlerMeta | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.BUTTON_DYNAMIC_HANDLER,
      ctor,
    );
    if (dynamicMeta) {
      const componentClass = dynamicMeta.component as Constructor;
      const dyn: DynamicButtonComponentMeta | undefined = Reflect.getMetadata(
        COMPONENT_METADATA_KEYS.BUTTON_DYNAMIC,
        componentClass,
      );
      if (!dyn) {
        throw new Error(
          `${ctor.name}: @DynamicButtonHandler references ${componentClass.name} which is not decorated with @DynamicButton().`,
        );
      }
      this.assertNoCollision(dyn.baseId);
      this.dynamicHandlers.push({ baseId: dyn.baseId, handlerCtor: ctor, handlerInstance: instance });
    }
  }

  bind(client: Client): void {
    if (this.staticHandlers.length === 0 && this.dynamicHandlers.length === 0) return;

    client.on(Events.InteractionCreate, (interaction: Interaction) => {
      if (!interaction.isButton()) return;

      const button = interaction as ButtonInteraction;
      const { baseId, contextId, payloadId } = splitCustomId(button.customId);

      const staticResolved = this.staticHandlers.find((h) => h.customId === baseId);
      if (staticResolved) {
        void this.dispatchStatic(button, staticResolved, contextId);
        return;
      }

      const dynResolved = this.dynamicHandlers.find((h) => h.baseId === baseId);
      if (dynResolved) {
        void this.dispatchDynamic(button, dynResolved, contextId, payloadId);
      }
    });
  }

  private async dispatchStatic(
    button: ButtonInteraction,
    resolved: ResolvedButtonHandler,
    contextId: string | undefined,
  ): Promise<void> {
    const handlerName = `@ButtonHandler(${resolved.handlerCtor.name})`;
    try {
      const flowCtx = await this.resolveFlowContext(button, contextId);
      if (flowCtx === null) return;

      const guardPassed = await GuardExecutor.execute(
        resolved.handlerCtor,
        'handle',
        new ComponentExecutionContext(button, resolved.customId),
      );
      if (!guardPassed) return;

      const args = this.buildArgs(resolved, button, flowCtx, undefined);
      await this.invoke(resolved.handlerInstance, args);
    } catch (err) {
      await this.reportError(err, button, handlerName);
    }
  }

  private async dispatchDynamic(
    button: ButtonInteraction,
    resolved: ResolvedDynamicButtonHandler,
    contextId: string | undefined,
    payloadId: string | undefined,
  ): Promise<void> {
    const handlerName = `@DynamicButtonHandler(${resolved.handlerCtor.name})`;
    try {
      const flowCtx = await this.resolveFlowContext(button, contextId);
      if (flowCtx === null) return;

      let payload: unknown;
      if (payloadId) {
        payload = await this.payloads.get(payloadId);
        if (payload === undefined) {
          const ephemeral = this.config?.button?.ephemeralErrors !== false;
          await button.reply(
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
        new ComponentExecutionContext(button, resolved.baseId),
      );
      if (!guardPassed) return;

      const args = this.buildArgs(resolved, button, flowCtx, payload, payloadId);
      await this.invoke(resolved.handlerInstance, args);
    } catch (err) {
      await this.reportError(err, button, handlerName);
    }
  }

  private buildArgs(
    resolved: ResolvedButtonHandler | ResolvedDynamicButtonHandler,
    button: ButtonInteraction,
    flowCtx: SpraxiumContext<unknown> | undefined,
    payload: unknown,
    payloadId?: string,
  ): Array<unknown> {
    const proto = resolved.handlerCtor.prototype as Record<string | symbol, unknown>;
    const ctxIndex: number | undefined = Reflect.getMetadata(METADATA_KEYS.CTX_PARAM, proto, 'handle');
    const flowCtxIndex: number | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.FLOW_CONTEXT_PARAM,
      proto,
      'handle',
    );
    const payloadIndex: number | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.BUTTON_PAYLOAD_PARAM,
      proto,
      'handle',
    );
    const payloadRefIndex: number | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.PAYLOAD_REF_PARAM,
      proto,
      'handle',
    );

    const args: Array<unknown> = [];
    if (ctxIndex !== undefined) args[ctxIndex] = button;
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
    interaction: ButtonInteraction,
    contextId: string | undefined,
  ): Promise<SpraxiumContext<unknown> | undefined | null> {
    if (!contextId) return undefined;

    const ephemeral = this.config?.button?.ephemeralErrors !== false;

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
      this.config?.button?.ephemeralErrors !== false,
      this.config?.button?.onErrorReply,
    );
  }

  private assertNoCollision(id: string): void {
    const isStatic = this.staticHandlers.some((h) => h.customId === id);
    const isDynamic = this.dynamicHandlers.some((h) => h.baseId === id);
    if (isStatic || isDynamic) {
      this.log.warn(
        `Button customId/baseId collision for "${id}". Two handlers share the same identifier; only the first registered will fire.`,
      );
    }
  }
}
