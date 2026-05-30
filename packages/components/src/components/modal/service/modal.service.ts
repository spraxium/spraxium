import 'reflect-metadata';
import { Injectable } from '@spraxium/common';
import type { ModalBuilder, ModalSubmitInteraction } from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
// biome-ignore lint/style/useImportType: needed for DI runtime injection
import { PayloadService } from '../../../runtime/payload';
import type { AnyConstructor } from '../../../types';
import { type InlineParams, encodeInlineParams, joinCustomId } from '../../../utils/custom-id';
import { ModalFieldCache } from '../cache';
import type { ModalCacheConfig, ModalComponentMetadata } from '../interfaces';
import { ModalRenderer } from '../renderer';
import { ModalSchemaBuilder } from '../schema';

@Injectable()
export class ModalService {
  private readonly schema = new ModalSchemaBuilder();
  private readonly renderer = new ModalRenderer();

  constructor(private readonly payloads: PayloadService) {}

  /**
   * Builds a `ModalBuilder` from a `@ModalComponent` class.
   * Optionally accepts runtime data for `@ModalDynamic` / `@ModalWhen` fields.
   */
  build<T = unknown>(ModalClass: AnyConstructor, data?: T): ModalBuilder {
    return this.renderer.render(this.schema.build(ModalClass, data as Record<string, unknown>));
  }

  /**
   * Builds a `ModalBuilder` with inline params encoded in the custom ID.
   * Params are injected via `@ModalParams()` in the handler.
   * Values must keep the total custom ID under 100 chars; use `buildWithPayload()` for larger data.
   */
  buildWithParams<P extends InlineParams, T = unknown>(
    ModalClass: AnyConstructor,
    params: P,
    data?: T,
  ): ModalBuilder {
    const meta = this.getComponentMeta(ModalClass);
    const encoded = encodeInlineParams(params);
    const customId = joinCustomId(meta.id, { inlineParams: encoded });
    const built = this.renderer.render(this.schema.build(ModalClass, data as Record<string, unknown>));
    return built.setCustomId(customId);
  }

  /**
   * Builds a `ModalBuilder` with a payload stored in `PayloadService`.
   * The payload ref (`~p:<id>`) is embedded in the custom ID and the payload
   * is injected via `@ModalPayload()` in the handler.
   *
   * @param ttl Payload time-to-live in seconds. Defaults to 900 (15 minutes).
   */
  async buildWithPayload<P, T = unknown>(
    ModalClass: AnyConstructor,
    payload: P,
    options?: { ttl?: number; data?: T },
  ): Promise<ModalBuilder> {
    const meta = this.getComponentMeta(ModalClass);
    const envelope = await this.payloads.create(payload, {
      ttl: options?.ttl ?? 900,
    });
    const customId = joinCustomId(meta.id, { payloadId: envelope.id });
    const built = this.renderer.render(
      this.schema.build(ModalClass, options?.data as Record<string, unknown>),
    );
    return built.setCustomId(customId);
  }

  /**
   * Builds a `ModalBuilder` and pre-fills text fields from the per-user cache
   * (populated on validation failure). Requires `@ModalCache` to be active.
   */
  buildFor<T = unknown>(
    ModalClass: AnyConstructor,
    interaction: { user: { id: string } },
    data?: T,
  ): ModalBuilder {
    const meta: ModalComponentMetadata | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.MODAL_COMPONENT,
      ModalClass,
    );

    const cachedValues = meta ? ModalFieldCache.get(ModalFieldCache.key(meta.id, interaction.user.id)) : null;

    return this.renderer.render(
      this.schema.build(ModalClass, data as Record<string, unknown>, cachedValues ?? undefined),
    );
  }

  /** Manually clears the per-user cache for a modal. */
  clearCacheFor(ModalClass: AnyConstructor, interaction: ModalSubmitInteraction): void {
    const meta: ModalComponentMetadata | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.MODAL_COMPONENT,
      ModalClass,
    );
    if (!meta) return;
    ModalFieldCache.delete(ModalFieldCache.key(meta.id, interaction.user.id));
  }

  /** Returns the cached values for a modal and user, or `null` if none. */
  getCacheFor(
    ModalClass: AnyConstructor,
    interaction: { user: { id: string } },
  ): Record<string, string> | null {
    const meta: ModalComponentMetadata | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.MODAL_COMPONENT,
      ModalClass,
    );
    if (!meta) return null;
    return ModalFieldCache.get(ModalFieldCache.key(meta.id, interaction.user.id));
  }

  /** @internal */
  storeCache(
    ModalClass: AnyConstructor,
    interaction: ModalSubmitInteraction,
    values: Record<string, string>,
  ): void {
    const cacheCfg: ModalCacheConfig | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.MODAL_CACHE_CONFIG,
      ModalClass,
    );
    if (!cacheCfg) return;

    const meta: ModalComponentMetadata | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.MODAL_COMPONENT,
      ModalClass,
    );
    if (!meta) return;

    ModalFieldCache.set(ModalFieldCache.key(meta.id, interaction.user.id), values, cacheCfg.ttl);
  }

  private getComponentMeta(ModalClass: AnyConstructor): ModalComponentMetadata {
    const meta: ModalComponentMetadata | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.MODAL_COMPONENT,
      ModalClass,
    );
    if (!meta) {
      throw new Error(`${ModalClass.name} is not decorated with @ModalComponent().`);
    }
    return meta;
  }
}
