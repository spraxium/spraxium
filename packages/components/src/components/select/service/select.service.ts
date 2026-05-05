import 'reflect-metadata';
import { Inject, Injectable, Optional } from '@spraxium/common';
import type { ActionRowBuilder } from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { SpraxiumContext } from '../../../runtime/context';
import { joinCustomId } from '../../../runtime/dispatcher/helpers/split-custom-id.helper';
import { PayloadService } from '../../../runtime/payload';
import type {
  DynamicSelectComponentMeta,
  DynamicSelectRenderable,
  SelectComponentMeta,
  SelectOptionConfig,
  SelectRenderConfig,
} from '../interfaces';
import { SelectRenderer } from '../renderer';
import type { AnySelectBuilder } from '../types';

type AnyClass = new (...args: Array<unknown>) => unknown;

/** Render-time override applied on top of a `@StringSelect` (or family) decorator's metadata. */
export interface SelectBuildOverrides {
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
}

@Injectable()
export class SelectService {
  private readonly renderer = new SelectRenderer();

  constructor(@Optional() @Inject(PayloadService) private readonly payloads?: PayloadService) {}

  async build(
    SelectClass: AnyClass,
    data?: unknown,
    context?: SpraxiumContext<unknown>,
    overrides?: SelectBuildOverrides,
  ): Promise<ActionRowBuilder<AnySelectBuilder>> {
    const { meta, options } = await this.resolve(SelectClass, data);

    const finalMeta = this.applyOverrides(meta, overrides);

    if (context) {
      finalMeta.customId = joinCustomId(finalMeta.customId, { contextId: context.id });
    }

    return this.renderer.renderRow(finalMeta, options);
  }

  /**
   * Builds a dynamic string-select from a `@DynamicStringSelect` class and arbitrary data.
   * The class's static `render(data)` returns the per-instance options. The
   * resolved `data` is persisted as a payload and referenced via `~p:<id>`.
   */
  async buildDynamic<TData>(
    DynamicSelectClass: AnyClass,
    data: TData,
    context?: SpraxiumContext<unknown>,
    overrides?: SelectBuildOverrides,
  ): Promise<ActionRowBuilder<AnySelectBuilder>> {
    if (!this.payloads) {
      throw new Error(
        '[SelectService] PayloadService is not registered. Ensure ComponentsModule is imported in your AppModule.',
      );
    }
    const meta = this.getDynamicMeta(DynamicSelectClass);
    const renderable = DynamicSelectClass as unknown as DynamicSelectRenderable<TData>;
    if (typeof renderable.render !== 'function') {
      throw new Error(
        `[SelectService] ${DynamicSelectClass.name} is decorated with @DynamicStringSelect but does not declare a static render(data) method.`,
      );
    }

    const cfg: SelectRenderConfig = renderable.render(data);
    const envelope = await this.payloads.create(data, { ttl: meta.payloadTtl });

    const composedMeta: SelectComponentMeta = {
      type: 'string',
      customId: joinCustomId(meta.baseId, { contextId: context?.id, payloadId: envelope.id }),
      placeholder: cfg.placeholder ?? meta.placeholder,
      minValues: cfg.minValues ?? meta.minValues,
      maxValues: cfg.maxValues ?? meta.maxValues,
      disabled: cfg.disabled ?? meta.disabled,
    };

    return this.renderer.renderRow(composedMeta, cfg.options);
  }

  private applyOverrides(meta: SelectComponentMeta, ov?: SelectBuildOverrides): SelectComponentMeta {
    if (!ov) return meta;
    const next: SelectComponentMeta = { ...meta };
    if (ov.placeholder !== undefined) next.placeholder = ov.placeholder;
    if (ov.minValues !== undefined) next.minValues = ov.minValues;
    if (ov.maxValues !== undefined) next.maxValues = ov.maxValues;
    if (ov.disabled !== undefined) next.disabled = ov.disabled;
    return next;
  }

  private async resolve(
    SelectClass: AnyClass,
    data?: unknown,
  ): Promise<{ meta: SelectComponentMeta; options: Array<SelectOptionConfig> }> {
    const meta = Reflect.getOwnMetadata(COMPONENT_METADATA_KEYS.SELECT_COMPONENT, SelectClass) as
      | SelectComponentMeta
      | undefined;

    if (!meta) {
      throw new Error(
        `[SelectService] ${(SelectClass as { name: string }).name} is not decorated with a select decorator. If this is a dynamic select, use buildDynamic() instead.`,
      );
    }

    const metaCopy: SelectComponentMeta = { ...meta };

    if (metaCopy.dynamicOptions && data !== undefined) {
      return { meta: metaCopy, options: await metaCopy.dynamicOptions(data) };
    }

    const staticOptions: Array<SelectOptionConfig> =
      Reflect.getOwnMetadata(COMPONENT_METADATA_KEYS.SELECT_OPTIONS_LIST, SelectClass) ?? [];

    return { meta: metaCopy, options: staticOptions };
  }

  private getDynamicMeta(DynamicSelectClass: AnyClass): DynamicSelectComponentMeta {
    const meta = Reflect.getOwnMetadata(COMPONENT_METADATA_KEYS.SELECT_DYNAMIC, DynamicSelectClass) as
      | DynamicSelectComponentMeta
      | undefined;
    if (!meta) {
      throw new Error(
        `[SelectService] ${(DynamicSelectClass as { name: string }).name} is not decorated with @DynamicStringSelect.`,
      );
    }
    return meta;
  }
}
