import 'reflect-metadata';
import { Inject, Injectable } from '@spraxium/common';
import {
  type ActionRowBuilder,
  ButtonBuilder,
  type ContainerBuilder,
  FileBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys';
import type { SpraxiumContext } from '../../../runtime/context';
import type { AnyConstructor } from '../../../types';
import { ButtonService } from '../../button';
import { DescriptionBuilder } from '../../embed';
import { SelectService } from '../../select';
import { V2ContainerFluentBuilder, buildContainer } from '../builder';
import type {
  V2ActionRowConfig,
  V2ChildDef,
  V2ContainerMeta,
  V2DynamicConfig,
  V2FileConfig,
  V2InnerBuilder,
  V2MediaGalleryConfig,
  V2ReplyPayload,
  V2SectionConfig,
  V2SeparatorConfig,
  V2TextDisplayConfig,
  V2ThumbnailConfig,
} from '../interfaces';

@Injectable()
export class V2Service {
  constructor(
    @Inject(ButtonService) private readonly buttons: ButtonService,
    @Inject(SelectService) private readonly selects: SelectService,
  ) {}

  build<T = unknown>(
    ContainerClass: AnyConstructor,
    data?: T,
    context?: SpraxiumContext<unknown>,
  ): ContainerBuilder {
    const meta: V2ContainerMeta | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.V2_CONTAINER,
      ContainerClass,
    );
    if (!meta) {
      throw new Error(`[V2Service] ${ContainerClass.name} is not decorated with @V2Container.`);
    }

    const children: Array<V2ChildDef> =
      Reflect.getMetadata(COMPONENT_METADATA_KEYS.V2_CHILDREN, ContainerClass) ?? [];
    const sorted = [...children].sort((a, b) => a.order - b.order);

    const built = sorted
      .filter((child) => !child.when || child.when(data))
      .flatMap((child) => {
        const result = this.buildChild(child, data, context);
        // biome-ignore lint/suspicious/noExplicitAny: generic callable type required
        return Array.isArray(result) ? (result as Array<any>) : [result];
      });

    return buildContainer(meta, built);
  }

  buildReply<T = unknown>(
    ContainerClass: AnyConstructor,
    data?: T,
    context?: SpraxiumContext<unknown>,
  ): V2ReplyPayload {
    return {
      components: [this.build(ContainerClass, data, context)],
      flags: MessageFlags.IsComponentsV2,
    };
  }

  container(opts: V2ContainerMeta = {}, context?: SpraxiumContext<unknown>): V2ContainerFluentBuilder {
    return new V2ContainerFluentBuilder(opts, context);
  }

  text(content: string | DescriptionBuilder): TextDisplayBuilder {
    const str = content instanceof DescriptionBuilder ? content.toString() : content;
    return new TextDisplayBuilder().setContent(str);
  }

  separator(config: V2SeparatorConfig = {}): SeparatorBuilder {
    const sep = new SeparatorBuilder().setDivider(config.divider ?? true);
    if (config.spacing !== undefined) sep.setSpacing(config.spacing);
    return sep;
  }

  gallery(items: Array<{ url: string; description?: string; spoiler?: boolean }>): MediaGalleryBuilder {
    const builder = new MediaGalleryBuilder();
    for (const item of items) {
      const mediaItem = new MediaGalleryItemBuilder().setURL(item.url);
      if (item.description) mediaItem.setDescription(item.description);
      if (item.spoiler) mediaItem.setSpoiler(true);
      builder.addItems(mediaItem);
    }
    return builder;
  }

  thumbnail(url: string, opts: { description?: string; spoiler?: boolean } = {}): ThumbnailBuilder {
    const t = new ThumbnailBuilder().setURL(url);
    if (opts.description) t.setDescription(opts.description);
    if (opts.spoiler) t.setSpoiler(true);
    return t;
  }

  section(text: string, accessory?: ThumbnailBuilder | ButtonBuilder): SectionBuilder {
    const sec = new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
    if (accessory instanceof ButtonBuilder) {
      sec.setButtonAccessory(accessory);
    } else if (accessory instanceof ThumbnailBuilder) {
      sec.setThumbnailAccessory(accessory);
    }
    return sec;
  }

  // biome-ignore lint/suspicious/noExplicitAny: generic callable type required
  private buildChild(child: V2ChildDef, data: unknown, context?: SpraxiumContext<unknown>): any {
    switch (child.type) {
      case 'textDisplay': {
        const cfg = child.config as V2TextDisplayConfig;
        const raw = typeof cfg.content === 'function' ? cfg.content(data) : cfg.content;
        const content = raw instanceof DescriptionBuilder ? raw.toString() : (raw as string);
        return new TextDisplayBuilder().setContent(content);
      }

      case 'separator': {
        const cfg = child.config as V2SeparatorConfig;
        const sep = new SeparatorBuilder().setDivider(cfg.divider ?? true);
        if (cfg.spacing !== undefined) sep.setSpacing(cfg.spacing);
        return sep;
      }

      case 'mediaGallery': {
        const cfg = child.config as V2MediaGalleryConfig;
        const rawItems = typeof cfg.items === 'function' ? cfg.items(data) : cfg.items;
        const gallery = new MediaGalleryBuilder();
        for (const item of rawItems) {
          const mediaItem = new MediaGalleryItemBuilder().setURL(item.url);
          if (item.description) mediaItem.setDescription(item.description);
          if (item.spoiler) mediaItem.setSpoiler(true);
          gallery.addItems(mediaItem);
        }
        return gallery;
      }

      case 'thumbnail': {
        const cfg = child.config as V2ThumbnailConfig;
        const url = typeof cfg.url === 'function' ? cfg.url(data) : cfg.url;
        const thumb = new ThumbnailBuilder().setURL(url);
        if (cfg.description) thumb.setDescription(cfg.description);
        if (cfg.spoiler) thumb.setSpoiler(true);
        return thumb;
      }

      case 'section': {
        const cfg = child.config as V2SectionConfig;
        const rawText = typeof cfg.text === 'function' ? cfg.text(data) : cfg.text;
        const text = rawText instanceof DescriptionBuilder ? rawText.toString() : (rawText as string);

        if (!cfg.button && !cfg.thumbnail) {
          return new TextDisplayBuilder().setContent(text);
        }

        const sec = new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(text));

        if (cfg.thumbnail) {
          const url = typeof cfg.thumbnail.url === 'function' ? cfg.thumbnail.url(data) : cfg.thumbnail.url;
          const t = new ThumbnailBuilder().setURL(url);
          if (cfg.thumbnail.description) t.setDescription(cfg.thumbnail.description);
          if (cfg.thumbnail.spoiler) t.setSpoiler(true);
          sec.setThumbnailAccessory(t);
        } else if (cfg.button) {
          const row = this.buttons.build(
            cfg.button,
            context as SpraxiumContext<Record<string, unknown>>,
          ) as ActionRowBuilder<ButtonBuilder>;
          const rawButton = row.toJSON().components[0] as ReturnType<ButtonBuilder['toJSON']>;
          const button = ButtonBuilder.from(rawButton);
          sec.setButtonAccessory(button);
        }
        return sec;
      }

      case 'file': {
        const cfg = child.config as V2FileConfig;
        const url = typeof cfg.url === 'function' ? cfg.url(data) : cfg.url;
        const file = new FileBuilder().setURL(url);
        if (cfg.spoiler) file.setSpoiler(true);
        return file;
      }

      case 'actionRow': {
        const cfg = child.config as V2ActionRowConfig;
        const rawComponents = typeof cfg.components === 'function' ? cfg.components(data) : cfg.components;

        if (rawComponents.length === 0) {
          throw new Error('[V2Service] @V2Row — components array cannot be empty.');
        }

        const firstClass = rawComponents[0];
        if (Reflect.hasMetadata(COMPONENT_METADATA_KEYS.SELECT_COMPONENT, firstClass)) {
          return this.selects.build(
            firstClass,
            cfg.rowData,
            context as SpraxiumContext<Record<string, unknown>>,
          );
        }

        return this.buttons.build(rawComponents, context as SpraxiumContext<Record<string, unknown>>);
      }

      case 'dynamic': {
        const cfg = child.config as V2DynamicConfig;
        return cfg
          .factory(data)
          .map((spec) =>
            this.buildChild({ ...spec, propertyKey: '__dynamic__', order: -1 } as V2ChildDef, data, context),
          );
      }

      default:
        throw new Error(`[V2Service] Unknown V2 child type: ${(child as V2ChildDef).type}`);
    }
  }
}
