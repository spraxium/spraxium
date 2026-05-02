import 'reflect-metadata';
import { Inject, Injectable, Optional } from '@spraxium/common';
import { ActionRowBuilder, type ButtonBuilder } from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { SpraxiumContext } from '../../../runtime/context';
import { joinCustomId } from '../../../runtime/dispatcher/helpers/split-custom-id.helper';
import { PayloadService } from '../../../runtime/payload';
import type { AnyConstructor } from '../../../types';
import type {
  ButtonBuildOverrides,
  ButtonComponentMeta,
  ButtonRenderConfig,
  DynamicButtonComponentMeta,
  DynamicButtonRenderable,
} from '../interfaces';
import type { ButtonEmojiConfig } from '../interfaces';
import { ButtonRenderer } from '../renderer';
import type { ButtonStyleName } from '../types';

@Injectable()
export class ButtonService {
  private readonly renderer = new ButtonRenderer();

  constructor(@Optional() @Inject(PayloadService) private readonly payloads?: PayloadService) {}

  /**
   * Builds an ActionRow from one or more `@Button` / `@LinkButton` classes.
   *
   * Optional render-time `overrides` can be applied per class
   * (label/style/disabled/emoji). Provide either a single overrides object
   * (applied to the first class) or a parallel array.
   */
  build(
    input: AnyConstructor | Array<AnyConstructor>,
    context?: SpraxiumContext<unknown>,
    overrides?: ButtonBuildOverrides | Array<ButtonBuildOverrides | undefined>,
  ): ActionRowBuilder<ButtonBuilder> {
    const classes = Array.isArray(input) ? input : [input];
    if (classes.length === 0) throw new Error('[ButtonService] build() requires at least one button class.');
    if (classes.length > 5) throw new Error('[ButtonService] Discord limits action rows to 5 buttons.');

    const overridesArr = Array.isArray(overrides) ? overrides : overrides ? [overrides] : [];

    const row = new ActionRowBuilder<ButtonBuilder>();
    classes.forEach((cls, idx) => {
      const meta = this.applyOverrides(this.getMeta(cls), overridesArr[idx]);
      const btn = this.renderer.render(meta);
      if (context && !meta.isLink) {
        btn.setCustomId(joinCustomId(meta.customId, { contextId: context.id }));
      }
      row.addComponents(btn);
    });
    return row;
  }

  rowWithContext(
    context: SpraxiumContext<unknown>,
    ...ButtonClasses: Array<AnyConstructor>
  ): ActionRowBuilder<ButtonBuilder> {
    return this.build(ButtonClasses, context);
  }

  /**
   * Builds N dynamic buttons from a `@DynamicButton` class and a list of items.
   * Each item produces one button: `DynamicButtonClass.render(item)` provides
   * the appearance, the item itself is persisted as a payload and referenced
   * via `~p:<id>` in the custom ID. Auto-chunks into action rows of up to 5.
   */
  async buildDynamic<TItem>(
    DynamicButtonClass: AnyConstructor,
    items: ReadonlyArray<TItem>,
    context?: SpraxiumContext<unknown>,
  ): Promise<Array<ActionRowBuilder<ButtonBuilder>>> {
    const flat = await this.buildDynamicButtons(DynamicButtonClass, items, context);
    const rows: Array<ActionRowBuilder<ButtonBuilder>> = [];
    for (let i = 0; i < flat.length; i += 5) {
      rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(flat.slice(i, i + 5)));
    }
    return rows;
  }

  /**
   * Like {@link buildDynamic}, but returns the flat list of `ButtonBuilder`s
   * without wrapping them in action rows. Used internally by `@V2DynamicRow`
   * and available for callers composing rows manually.
   */
  async buildDynamicButtons<TItem>(
    DynamicButtonClass: AnyConstructor,
    items: ReadonlyArray<TItem>,
    context?: SpraxiumContext<unknown>,
  ): Promise<Array<ButtonBuilder>> {
    if (!this.payloads) {
      throw new Error(
        '[ButtonService] PayloadService is not registered. Ensure ComponentsModule is imported in your AppModule.',
      );
    }
    const meta = this.getDynamicMeta(DynamicButtonClass);
    const renderable = DynamicButtonClass as unknown as DynamicButtonRenderable<TItem>;
    if (typeof renderable.render !== 'function') {
      throw new Error(
        `[ButtonService] ${DynamicButtonClass.name} is decorated with @DynamicButton but does not declare a static render(item) method.`,
      );
    }

    const buttons: Array<ButtonBuilder> = [];
    for (const item of items) {
      const cfg: ButtonRenderConfig = renderable.render(item);
      const envelope = await this.payloads.create(item, { ttl: meta.payloadTtl });
      const btn = this.renderer.render({
        isLink: false,
        customId: meta.baseId,
        label: cfg.label,
        style: cfg.style,
        emoji: cfg.emoji,
        disabled: cfg.disabled,
      } as ButtonComponentMeta);
      btn.setCustomId(joinCustomId(meta.baseId, { contextId: context?.id, payloadId: envelope.id }));
      buttons.push(btn);
    }
    return buttons;
  }

  private applyOverrides(meta: ButtonComponentMeta, ov?: ButtonBuildOverrides): ButtonComponentMeta {
    if (!ov) return meta;
    const next: ButtonComponentMeta = { ...meta };
    if (ov.label !== undefined) next.label = ov.label;
    if (ov.disabled !== undefined) next.disabled = ov.disabled;
    if (ov.emoji !== undefined) (next as { emoji?: ButtonEmojiConfig }).emoji = ov.emoji;
    if (ov.style !== undefined && !next.isLink) {
      (next as { style?: ButtonStyleName }).style = ov.style;
    }
    return next;
  }

  private getMeta(ButtonClass: AnyConstructor): ButtonComponentMeta {
    const meta = Reflect.getOwnMetadata(COMPONENT_METADATA_KEYS.BUTTON_COMPONENT, ButtonClass) as
      | ButtonComponentMeta
      | undefined;

    if (!meta) {
      throw new Error(
        `[ButtonService] ${ButtonClass.name} is not decorated with @Button or @LinkButton. If this is a dynamic button, use buildDynamic() instead.`,
      );
    }
    return meta;
  }

  private getDynamicMeta(DynamicButtonClass: AnyConstructor): DynamicButtonComponentMeta {
    const meta = Reflect.getOwnMetadata(COMPONENT_METADATA_KEYS.BUTTON_DYNAMIC, DynamicButtonClass) as
      | DynamicButtonComponentMeta
      | undefined;
    if (!meta) {
      throw new Error(`[ButtonService] ${DynamicButtonClass.name} is not decorated with @DynamicButton.`);
    }
    return meta;
  }
}
