import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import { type AnySelectMenuInteraction, type Client, Events, type Interaction } from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { SelectComponentMeta, SelectHandlerMeta } from '../../../components/select';
import { ContextStore } from '../../context';
import type { ComponentsConfig, SpraxiumContext } from '../../lifecycle';
import { resolveContextError } from '../helpers/context-error.helper';
import { splitCustomId } from '../helpers/split-custom-id.helper';
import type { Constructor, ResolvedSelectHandler } from '../interfaces';

/**
 * Handles registration and dispatch of select menu interactions.
 * Supports all select menu types (string, user, role, mentionable, channel).
 */
export class SelectDispatcher {
  private readonly handlers: Array<ResolvedSelectHandler> = [];
  private config?: ComponentsConfig;

  setConfig(config: ComponentsConfig): void {
    this.config = config;
  }

  get size(): number {
    return this.handlers.length;
  }

  register(ctor: Constructor, instance: unknown): void {
    const handlerMeta: SelectHandlerMeta | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.SELECT_HANDLER,
      ctor,
    );
    if (!handlerMeta) return;

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

    this.handlers.push({
      customId: componentMeta.customId,
      handlerCtor: ctor,
      handlerInstance: instance,
    });
  }

  bind(client: Client): void {
    if (this.handlers.length === 0) return;

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
      const { baseId, contextId } = splitCustomId(select.customId);
      const resolved = this.handlers.find((h) => h.customId === baseId);
      if (!resolved) return;

      void this.handleSelect(select, resolved, contextId);
    });
  }

  private async handleSelect(
    select: AnySelectMenuInteraction,
    resolved: ResolvedSelectHandler,
    contextId: string | undefined,
  ): Promise<void> {
    try {
      let flowCtx: SpraxiumContext<unknown> | undefined;
      if (contextId) {
        const ephemeral = this.config?.select?.ephemeralErrors !== false;

        flowCtx = await ContextStore.get(contextId);
        if (!flowCtx) {
          await select.reply(
            resolveContextError(
              this.config?.errorMessages?.expired,
              '❌ This interaction has expired.',
              ephemeral,
            ),
          );
          return;
        }
        if (flowCtx.restrictedTo && flowCtx.restrictedTo !== select.user.id) {
          await select.reply(
            resolveContextError(
              this.config?.errorMessages?.restricted,
              '❌ You are not allowed to use this component.',
              ephemeral,
            ),
          );
          return;
        }
      }

      const proto = resolved.handlerCtor.prototype as Record<string | symbol, unknown>;
      const ctxIndex: number | undefined = Reflect.getMetadata(METADATA_KEYS.CTX_PARAM, proto, 'handle');
      const selectedValuesIndices: Array<number> =
        Reflect.getMetadata(COMPONENT_METADATA_KEYS.SELECT_SELECTED_VALUES_PARAM, proto, 'handle') ?? [];
      const flowCtxIndex: number | undefined = Reflect.getMetadata(
        COMPONENT_METADATA_KEYS.FLOW_CONTEXT_PARAM,
        proto,
        'handle',
      );

      const args: Array<unknown> = [];
      if (ctxIndex !== undefined) args[ctxIndex] = select;
      for (const idx of selectedValuesIndices) args[idx] = select.values;
      if (flowCtxIndex !== undefined) args[flowCtxIndex] = flowCtx;

      const fn = (resolved.handlerInstance as Record<string | symbol, (...a: Array<unknown>) => unknown>)
        .handle;
      if (typeof fn !== 'function') return;
      await Promise.resolve(fn.call(resolved.handlerInstance, ...args));
    } catch (err) {
      console.error('[Spraxium] Unhandled error in select handler:', err);
    }
  }
}
