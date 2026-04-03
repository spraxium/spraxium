import 'reflect-metadata';
import { Injectable } from '@spraxium/common';
import { ActionRowBuilder, type ButtonBuilder } from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { SpraxiumContext } from '../../../runtime/context';
import type { AnyConstructor } from '../../../types';
import type { ButtonComponentMeta, DynamicButtonConfig } from '../interfaces';
import { ButtonRenderer } from '../renderer';

@Injectable()
export class ButtonService {
  private readonly renderer = new ButtonRenderer();

  build(
    input: AnyConstructor | Array<AnyConstructor>,
    context?: SpraxiumContext<unknown>,
  ): ActionRowBuilder<ButtonBuilder> {
    const classes = Array.isArray(input) ? input : [input];
    if (classes.length === 0) throw new Error('[ButtonService] build() requires at least one button class.');
    if (classes.length > 5) throw new Error('[ButtonService] Discord limits action rows to 5 buttons.');

    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const cls of classes) {
      const btn = this.renderer.render(this.getMeta(cls));
      if (context) this.appendContext(btn, context);
      row.addComponents(btn);
    }
    return row;
  }

  rowWithContext(
    context: SpraxiumContext<unknown>,
    ...ButtonClasses: Array<AnyConstructor>
  ): ActionRowBuilder<ButtonBuilder> {
    return this.build(ButtonClasses, context);
  }

  buildDynamic(
    DynamicClass: AnyConstructor,
    data: string,
    context?: SpraxiumContext<unknown>,
  ): ActionRowBuilder<ButtonBuilder> {
    const meta = this.getDynamicMeta(DynamicClass);
    const dynamicMeta: ButtonComponentMeta = {
      isLink: false,
      isDynamic: true,
      ...meta,
    };
    const btn = this.renderer.render(dynamicMeta);

    const base = `${meta.prefix}:${data}`;
    btn.setCustomId(context ? `${base}~${context.id}` : base);

    return new ActionRowBuilder<ButtonBuilder>().addComponents(btn);
  }

  private appendContext(btn: ButtonBuilder, context: SpraxiumContext<unknown>): void {
    const json = btn.toJSON();
    if ('custom_id' in json && json.custom_id) {
      btn.setCustomId(`${json.custom_id}~${context.id}`);
    }
  }

  private getMeta(ButtonClass: AnyConstructor): ButtonComponentMeta {
    const meta = Reflect.getOwnMetadata(COMPONENT_METADATA_KEYS.BUTTON_COMPONENT, ButtonClass) as
      | ButtonComponentMeta
      | undefined;

    if (!meta) {
      throw new Error(`[ButtonService] ${ButtonClass.name} is not decorated with @Button or @LinkButton.`);
    }
    return meta;
  }

  private getDynamicMeta(DynamicClass: AnyConstructor): DynamicButtonConfig {
    const meta = Reflect.getOwnMetadata(COMPONENT_METADATA_KEYS.DYNAMIC_BUTTON_COMPONENT, DynamicClass) as
      | ButtonComponentMeta
      | undefined;

    if (!meta || !('prefix' in meta)) {
      throw new Error(`[ButtonService] ${DynamicClass.name} is not decorated with @DynamicButton.`);
    }
    return meta as unknown as DynamicButtonConfig;
  }
}
