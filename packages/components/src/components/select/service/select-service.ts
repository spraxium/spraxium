import 'reflect-metadata';
import { Injectable, METADATA_KEYS } from '@spraxium/common';
import type { ActionRowBuilder } from 'discord.js';
import type { SpraxiumContext } from '../../../runtime/context';
import type { SelectComponentMeta, SelectOptionConfig } from '../interfaces';
import { SelectRenderer } from '../renderer';
import type { AnySelectBuilder } from '../types';

type AnyClass = new (...args: Array<unknown>) => unknown;

@Injectable()
export class SelectService {
  private readonly renderer = new SelectRenderer();

  async build(
    SelectClass: AnyClass,
    data?: unknown,
    context?: SpraxiumContext<unknown>,
  ): Promise<ActionRowBuilder<AnySelectBuilder>> {
    const { meta, options } = await this.resolve(SelectClass, data);

    if (context) {
      meta.customId = `${meta.customId}~${context.id}`;
    }

    return this.renderer.renderRow(meta, options);
  }

  private async resolve(
    SelectClass: AnyClass,
    data?: unknown,
  ): Promise<{ meta: SelectComponentMeta; options: Array<SelectOptionConfig> }> {
    const meta = Reflect.getOwnMetadata(METADATA_KEYS.SELECT_COMPONENT, SelectClass) as
      | SelectComponentMeta
      | undefined;

    if (!meta) {
      throw new Error(`[SelectService] ${SelectClass.name} is not decorated with a select decorator.`);
    }

    const metaCopy = { ...meta };

    if (metaCopy.dynamicOptions && data) {
      return { meta: metaCopy, options: await metaCopy.dynamicOptions(data) };
    }

    const staticOptions: Array<SelectOptionConfig> =
      Reflect.getOwnMetadata(METADATA_KEYS.SELECT_OPTIONS_LIST, SelectClass) ?? [];

    return { meta: metaCopy, options: staticOptions };
  }
}
