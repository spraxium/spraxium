import {
  type ActionRowBuilder,
  ButtonBuilder,
  type ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from 'discord.js';
import type { SpraxiumContext } from '../../../runtime/context';
import type { DescriptionBuilder } from '../../embed';
import type { V2ContainerMeta, V2InnerBuilder, V2MediaGalleryItem, V2SeparatorConfig } from '../interfaces';
import { buildContainer } from './build-container';

export class V2ContainerFluentBuilder {
  private readonly _components: Array<V2InnerBuilder> = [];

  constructor(
    private readonly meta: V2ContainerMeta,
    private readonly _context?: SpraxiumContext<unknown>,
  ) {}

  add(component: V2InnerBuilder): this {
    this._components.push(component);
    return this;
  }

  text(content: string | DescriptionBuilder): this {
    const str = typeof content === 'string' ? content : content.toString();
    return this.add(new TextDisplayBuilder().setContent(str));
  }

  sep(config?: V2SeparatorConfig): this {
    const sep = new SeparatorBuilder().setDivider(config?.divider ?? true);
    if (config?.spacing !== undefined) sep.setSpacing(config.spacing);
    return this.add(sep);
  }

  section(text: string, accessory?: ThumbnailBuilder | ButtonBuilder): this {
    if (!accessory) {
      return this.add(new TextDisplayBuilder().setContent(text));
    }
    const sec = new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
    if (accessory instanceof ButtonBuilder) {
      sec.setButtonAccessory(accessory);
    } else if (accessory instanceof ThumbnailBuilder) {
      sec.setThumbnailAccessory(accessory);
    }
    return this.add(sec);
  }

  gallery(items: Array<V2MediaGalleryItem>): this {
    const gallery = new MediaGalleryBuilder();
    for (const item of items) {
      const mediaItem = new MediaGalleryItemBuilder().setURL(item.url);
      if (item.description) mediaItem.setDescription(item.description);
      if (item.spoiler) mediaItem.setSpoiler(item.spoiler);
      gallery.addItems(mediaItem);
    }
    return this.add(gallery);
  }

  // biome-ignore lint/suspicious/noExplicitAny: generic callable type required
  row(actionRow: ActionRowBuilder<any>): this {
    return this.add(actionRow);
  }

  render(): ContainerBuilder {
    return buildContainer(this.meta, this._components);
  }

  toReply(): { components: Array<ContainerBuilder>; flags: MessageFlags.IsComponentsV2 } {
    return {
      components: [this.render()],
      flags: MessageFlags.IsComponentsV2,
    };
  }
}
