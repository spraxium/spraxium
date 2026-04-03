import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import { type ButtonInteraction, type Client, Events, type Interaction } from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys';
import type { ButtonComponentMeta, ButtonHandlerMeta, DynamicButtonConfig } from '../../../components/button';
import { ContextStore } from '../../context';
import type { ComponentsConfig, SpraxiumContext } from '../../lifecycle';
import { resolveContextError } from '../helpers/context-error.helper';
import { splitCustomId } from '../helpers/split-custom-id';
import type { Constructor, ResolvedButtonHandler, ResolvedDynamicButtonHandler } from '../interfaces';

/**
 * Handles registration and dispatch of button interactions.
 * Supports both static (fixed custom ID) and dynamic (prefix based) buttons.
 */
export class ButtonDispatcher {
  private readonly staticHandlers: Array<ResolvedButtonHandler> = [];
  private readonly dynamicHandlers: Array<ResolvedDynamicButtonHandler> = [];
  private config?: ComponentsConfig;

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

  registerDynamic(ctor: Constructor, instance: unknown): void {
    const handlerMeta: ButtonHandlerMeta | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.DYNAMIC_BUTTON_HANDLER,
      ctor,
    );
    if (!handlerMeta) return;

    const componentClass = handlerMeta.component as Constructor;
    const componentMeta: DynamicButtonConfig | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.DYNAMIC_BUTTON_COMPONENT,
      componentClass,
    );
    if (!componentMeta) {
      throw new Error(
        `${ctor.name}: @DynamicButtonHandler references ${componentClass.name} which is not decorated with @DynamicButton().`,
      );
    }

    this.dynamicHandlers.push({
      prefix: componentMeta.prefix,
      handlerCtor: ctor,
      handlerInstance: instance,
    });
  }

  bind(client: Client): void {
    if (this.staticHandlers.length === 0 && this.dynamicHandlers.length === 0) return;

    client.on(Events.InteractionCreate, (interaction: Interaction) => {
      if (!interaction.isButton()) return;

      const button = interaction as ButtonInteraction;
      const { baseId, contextId } = splitCustomId(button.customId);

      const staticResolved = this.staticHandlers.find((h) => h.customId === baseId);
      if (staticResolved) {
        void this.dispatchStatic(button, staticResolved, contextId);
        return;
      }

      const dynamicResolved = this.dynamicHandlers.find(
        (h) => baseId === h.prefix || baseId.startsWith(`${h.prefix}:`),
      );
      if (dynamicResolved) {
        void this.dispatchDynamic(button, dynamicResolved, baseId, contextId);
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

  private async dispatchDynamic(
    button: ButtonInteraction,
    resolved: ResolvedDynamicButtonHandler,
    baseId: string,
    contextId: string | undefined,
  ): Promise<void> {
    try {
      const flowCtx = await this.resolveFlowContext(button, contextId);
      if (flowCtx === null) return;

      const proto = resolved.handlerCtor.prototype as Record<string | symbol, unknown>;
      const ctxIndex: number | undefined = Reflect.getMetadata(METADATA_KEYS.CTX_PARAM, proto, 'handle');
      const flowCtxIndex: number | undefined = Reflect.getMetadata(
        COMPONENT_METADATA_KEYS.FLOW_CONTEXT_PARAM,
        proto,
        'handle',
      );
      const selectedIndex: number | undefined = Reflect.getMetadata(
        COMPONENT_METADATA_KEYS.SELECTED_PARAM,
        proto,
        'handle',
      );

      const dynamicData = baseId.startsWith(`${resolved.prefix}:`)
        ? baseId.slice(resolved.prefix.length + 1)
        : '';

      const args: Array<unknown> = [];
      if (ctxIndex !== undefined) args[ctxIndex] = button;
      if (flowCtxIndex !== undefined) args[flowCtxIndex] = flowCtx;
      if (selectedIndex !== undefined) args[selectedIndex] = dynamicData;

      const fn = (resolved.handlerInstance as Record<string | symbol, (...a: Array<unknown>) => unknown>)
        .handle;
      if (typeof fn !== 'function') return;
      await Promise.resolve(fn.call(resolved.handlerInstance, ...args));
    } catch (err) {
      console.error('[Spraxium] Unhandled error in @DynamicButtonHandler:', err);
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
