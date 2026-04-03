import 'reflect-metadata';
import { Injectable, METADATA_KEYS } from '@spraxium/common';
import type { ModalBuilder, ModalSubmitInteraction } from 'discord.js';
import type { AnyConstructor } from '../../../types';
import { ModalFieldCache } from '../cache';
import type { ModalCacheConfig, ModalComponentMetadata } from '../interfaces';
import { ModalRenderer } from '../renderer';
import { ModalSchemaBuilder } from '../schema';

@Injectable()
export class ModalService {
  private readonly schema = new ModalSchemaBuilder();
  private readonly renderer = new ModalRenderer();

  /**
   * Builds a `ModalBuilder` from a `@ModalComponent` class.
   * Optionally accepts runtime data for `@ModalDynamic` / `@ModalWhen` fields.
   */
  build<T = unknown>(ModalClass: AnyConstructor, data?: T): ModalBuilder {
    return this.renderer.render(this.schema.build(ModalClass, data as Record<string, unknown>));
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
      METADATA_KEYS.MODAL_COMPONENT,
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
      METADATA_KEYS.MODAL_COMPONENT,
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
      METADATA_KEYS.MODAL_COMPONENT,
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
      METADATA_KEYS.MODAL_CACHE_CONFIG,
      ModalClass,
    );
    if (!cacheCfg) return;

    const meta: ModalComponentMetadata | undefined = Reflect.getMetadata(
      METADATA_KEYS.MODAL_COMPONENT,
      ModalClass,
    );
    if (!meta) return;

    ModalFieldCache.set(ModalFieldCache.key(meta.id, interaction.user.id), values, cacheCfg.ttl);
  }
}
