import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import { GuardExecutor } from '@spraxium/core';
import { type ButtonInteraction, type Client, Events, type Interaction } from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { ButtonComponentMeta, ButtonHandlerMeta } from '../../../components/button';
import { ContextStore } from '../../context';
import { ComponentExecutionContext } from '../../guards';
import type { ComponentsConfig, SpraxiumContext } from '../../lifecycle';
import { resolveContextError } from '../helpers/context-error.helper';
import { splitCustomId } from '../helpers/split-custom-id.helper';
import type { Constructor, ResolvedButtonHandler } from '../interfaces';

/**
 * Handles registration and dispatch of button interactions.
 */
export class ButtonDispatcher {
  private readonly staticHandlers: Array<ResolvedButtonHandler> = [];
  private config?: ComponentsConfig;

  setConfig(config: ComponentsConfig): void {
    this.config = config;
  }

  get size(): number {
    return this.staticHandlers.length;
  }

  registerStatic(ctor: Constructor, instance: unknown): void {
    const handlerMeta: ButtonHandlerMeta | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.BUTTON_HANDLER,
      ctor,
    );
    if (!handlerMeta) return;

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
        `${ctor.name}: @ButtonHandler references ${componentClass.name} which is a @LinkButton — link buttons do not fire interactions.`,
      );
    }

    this.staticHandlers.push({
      customId: (componentMeta as ButtonComponentMeta & { customId: string }).customId,
      handlerCtor: ctor,
      handlerInstance: instance,
    });
  }

  bind(client: Client): void {
    if (this.staticHandlers.length === 0) return;

    client.on(Events.InteractionCreate, (interaction: Interaction) => {
      if (!interaction.isButton()) return;

      const button = interaction as ButtonInteraction;
      const { baseId, contextId } = splitCustomId(button.customId);

      const staticResolved = this.staticHandlers.find((h) => h.customId === baseId);
      if (staticResolved) {
        void this.dispatchStatic(button, staticResolved, contextId);
      }
    });
  }

  private async dispatchStatic(
    button: ButtonInteraction,
    resolved: ResolvedButtonHandler,
    contextId: string | undefined,
  ): Promise<void> {
    try {
      const flowCtx = await this.resolveFlowContext(button, contextId);
      if (flowCtx === null) return;

      const guardPassed = await GuardExecutor.execute(
        resolved.handlerCtor,
        'handle',
        new ComponentExecutionContext(button, resolved.customId),
      );
      if (!guardPassed) return;

      const proto = resolved.handlerCtor.prototype as Record<string | symbol, unknown>;
      const ctxIndex: number | undefined = Reflect.getMetadata(METADATA_KEYS.CTX_PARAM, proto, 'handle');
      const flowCtxIndex: number | undefined = Reflect.getMetadata(
        COMPONENT_METADATA_KEYS.FLOW_CONTEXT_PARAM,
        proto,
        'handle',
      );

      const args: Array<unknown> = [];
      if (ctxIndex !== undefined) args[ctxIndex] = button;
      if (flowCtxIndex !== undefined) args[flowCtxIndex] = flowCtx;

      const fn = (resolved.handlerInstance as Record<string | symbol, (...a: Array<unknown>) => unknown>)
        .handle;
      if (typeof fn !== 'function') return;
      await Promise.resolve(fn.call(resolved.handlerInstance, ...args));
    } catch (err) {
      console.error('[Spraxium] Unhandled error in @ButtonHandler:', err);
    }
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
}
