import {
  ActionRowBuilder,
  ContainerBuilder,
  FileBuilder,
  MediaGalleryBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
} from 'discord.js';
import type { V2ContainerMeta } from '../interfaces';
import type { V2InnerBuilder } from '../interfaces';
import { resolveAccentColor } from './resolve-accent-color';

/**
 * Assembles a Discord `ContainerBuilder` from V2 metadata and a list of child components.
 */
export function buildContainer(meta: V2ContainerMeta, components: Array<V2InnerBuilder>): ContainerBuilder {
  const builder = new ContainerBuilder();
  if (meta.accentColor !== undefined) {
    const color = resolveAccentColor(meta.accentColor);
    if (color !== undefined) builder.setAccentColor(color);
  }
  if (meta.spoiler) builder.setSpoiler(true);
  for (const component of components) {
    if (component instanceof TextDisplayBuilder) {
      builder.addTextDisplayComponents(component);
    } else if (component instanceof SeparatorBuilder) {
      builder.addSeparatorComponents(component);
    } else if (component instanceof SectionBuilder) {
      builder.addSectionComponents(component);
    } else if (component instanceof MediaGalleryBuilder) {
      builder.addMediaGalleryComponents(component);
    } else if (component instanceof FileBuilder) {
      builder.addFileComponents(component);
    } else if (component instanceof ActionRowBuilder) {
      // biome-ignore lint/suspicious/noExplicitAny: generic callable type required
      builder.addActionRowComponents(component as ActionRowBuilder<any>);
    }
  }
  return builder;
}
