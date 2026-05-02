import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import { GuardExecutor } from '@spraxium/core';
import { type Client, Events, type Interaction, type ModalSubmitInteraction } from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type {
  ModalCacheConfig,
  ModalComponentMetadata,
  ModalFieldDef,
  ModalFieldMetadata,
  ModalHandlerMetadata,
  ModalValidationError,
  ModalValidationOptions,
} from '../../../components/modal';
import {
  ModalFieldCache,
  ModalValidatorRunner,
  buildDefaultValidationEmbed,
} from '../../../components/modal';
import { ComponentExecutionContext } from '../../guards';
import type { ComponentsConfig } from '../../lifecycle';
import type { Constructor, ResolvedModalHandler } from '../interfaces';

/**
 * Handles registration and dispatch of modal submission interactions.
 * Manages field resolution, validation, and cache clearing.
 */
export class ModalDispatcher {
  private readonly handlers: Array<ResolvedModalHandler> = [];

  get size(): number {
    return this.handlers.length;
  }

  register(ctor: Constructor, instance: unknown): void {
    const handlerMeta: ModalHandlerMetadata | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.MODAL_HANDLER,
      ctor,
    );
    if (!handlerMeta) return;

    const builderCtor = handlerMeta.builder as Constructor;
    const componentMeta: ModalComponentMetadata | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.MODAL_COMPONENT,
      builderCtor,
    );
    if (!componentMeta) {
      throw new Error(
        `${ctor.name}: @ModalHandler references ${builderCtor.name} which is not decorated with @ModalComponent().`,
      );
    }

    this.handlers.push({
      customId: componentMeta.id,
      handlerCtor: ctor,
      handlerInstance: instance,
      builderCtor,
    });
  }

  bind(client: Client, config?: ComponentsConfig): void {
    if (this.handlers.length === 0) return;

    client.on(Events.InteractionCreate, (interaction: Interaction) => {
      if (!interaction.isModalSubmit()) return;

      const modal = interaction as ModalSubmitInteraction;
      const resolved = this.handlers.find((h) => h.customId === modal.customId);
      if (!resolved) return;

      void this.handleSubmission(modal, resolved, config);
    });
  }

  private async handleSubmission(
    modal: ModalSubmitInteraction,
    resolved: ResolvedModalHandler,
    config?: ComponentsConfig,
  ): Promise<void> {
    try {
      const errors = ModalValidatorRunner.validate(resolved.builderCtor, modal);
      if (errors.length > 0) {
        await this.handleValidationFailure(modal, resolved, errors, config);
        return;
      }

      const guardPassed = await GuardExecutor.execute(
        resolved.handlerCtor,
        'handle',
        new ComponentExecutionContext(modal, resolved.customId),
      );
      if (!guardPassed) return;

      const args = this.resolveHandlerArgs(modal, resolved);

      const fn = (resolved.handlerInstance as Record<string | symbol, (...a: Array<unknown>) => unknown>)
        .handle;
      if (typeof fn !== 'function') return;
      await Promise.resolve(fn.call(resolved.handlerInstance, ...args));

      this.clearCacheOnSuccess(resolved, modal);
    } catch (err) {
      console.error('[Spraxium] Unhandled error in @ModalHandler:', err);
    }
  }

  private async handleValidationFailure(
    modal: ModalSubmitInteraction,
    resolved: ResolvedModalHandler,
    errors: Array<ModalValidationError>,
    config?: ComponentsConfig,
  ): Promise<void> {
    const cacheConfig: ModalCacheConfig | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.MODAL_CACHE_CONFIG,
      resolved.builderCtor,
    );
    if (cacheConfig) {
      ModalFieldCache.set(
        ModalFieldCache.key(resolved.customId, modal.user.id),
        ModalValidatorRunner.collectAllValues(modal),
        cacheConfig.ttl,
      );
    }

    const validationConfig: ModalValidationOptions | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.MODAL_VALIDATION_CONFIG,
      resolved.builderCtor,
    );
    const embedFn = validationConfig?.embed ?? config?.modal?.validationEmbed;
    const embed = embedFn ? embedFn(errors) : buildDefaultValidationEmbed(errors);

    await modal.reply({
      // biome-ignore lint/suspicious/noExplicitAny: discord.js embed type mismatch
      embeds: [embed as any],
      ephemeral: validationConfig?.ephemeral ?? true,
    });
  }

  private resolveHandlerArgs(modal: ModalSubmitInteraction, resolved: ResolvedModalHandler): Array<unknown> {
    const proto = resolved.handlerCtor.prototype as Record<string | symbol, unknown>;
    const ctxIndex: number | undefined = Reflect.getMetadata(METADATA_KEYS.CTX_PARAM, proto, 'handle');
    const fieldParams: Array<{ index: number; fieldId: string }> =
      Reflect.getMetadata(COMPONENT_METADATA_KEYS.MODAL_FIELD_PARAM, proto, 'handle') ?? [];

    const fieldDefById = this.buildFieldDefMap(resolved.builderCtor);

    const args: Array<unknown> = [];
    if (ctxIndex !== undefined) args[ctxIndex] = modal;

    for (const { index, fieldId } of fieldParams) {
      args[index] = this.resolveFieldValue(modal, fieldId, fieldDefById.get(fieldId));
    }

    return args;
  }

  private buildFieldDefMap(builderCtor: Constructor): Map<string, ModalFieldDef> {
    const modalProto = builderCtor.prototype;
    const fieldKeys: Array<string> =
      Reflect.getMetadata(COMPONENT_METADATA_KEYS.MODAL_FIELDS_LIST, builderCtor) ?? [];

    return new Map<string, ModalFieldDef>(
      fieldKeys.flatMap((key): Array<[string, ModalFieldDef]> => {
        const meta: ModalFieldMetadata | undefined = Reflect.getMetadata(
          COMPONENT_METADATA_KEYS.MODAL_FIELD,
          modalProto,
          key,
        );
        if (!meta || meta.field.type === 'text_display') return [];
        return [[meta.field.id, meta.field]];
      }),
    );
  }

  private resolveFieldValue(
    modal: ModalSubmitInteraction,
    fieldId: string,
    def: ModalFieldDef | undefined,
  ): unknown {
    try {
      if (!def || def.type === 'text') {
        return modal.fields.getTextInputValue(fieldId);
      }
      if (def.type === 'string_select') {
        const values = modal.fields.getStringSelectValues(fieldId);
        const isMulti = def.maxValues !== undefined && def.maxValues > 1;
        return isMulti ? values : (values[0] ?? null);
      }
      if (def.type === 'user_select') {
        const coll = modal.fields.getSelectedUsers(fieldId);
        const isMulti = def.maxValues !== undefined && def.maxValues > 1;
        return isMulti ? [...(coll?.values() ?? [])] : (coll?.first() ?? null);
      }
      if (def.type === 'role_select') {
        const coll = modal.fields.getSelectedRoles(fieldId);
        const isMulti = def.maxValues !== undefined && def.maxValues > 1;
        return isMulti ? [...(coll?.values() ?? [])] : (coll?.first() ?? null);
      }
      if (def.type === 'channel_select') {
        const coll = modal.fields.getSelectedChannels(fieldId);
        const isMulti = def.maxValues !== undefined && def.maxValues > 1;
        return isMulti ? [...(coll?.values() ?? [])] : (coll?.first() ?? null);
      }
      if (def.type === 'mentionable_select') {
        return modal.fields.getSelectedMentionables(fieldId);
      }
      if (def.type === 'file_upload') {
        return modal.fields.getUploadedFiles(fieldId);
      }
      if (def.type === 'radio_group') {
        return modal.fields.getRadioGroup(fieldId) ?? null;
      }
      if (def.type === 'checkbox_group') {
        return modal.fields.getCheckboxGroup(fieldId);
      }
      if (def.type === 'checkbox') {
        return modal.fields.getCheckbox(fieldId);
      }
      return null;
    } catch {
      return null;
    }
  }

  private clearCacheOnSuccess(resolved: ResolvedModalHandler, modal: ModalSubmitInteraction): void {
    const cacheConfig: ModalCacheConfig | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.MODAL_CACHE_CONFIG,
      resolved.builderCtor,
    );
    if (cacheConfig) {
      ModalFieldCache.delete(ModalFieldCache.key(resolved.customId, modal.user.id));
    }
  }
}
