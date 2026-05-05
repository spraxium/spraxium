import {
  ActionRowBuilder,
  ContainerBuilder,
  FileBuilder,
  MediaGalleryBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from 'discord.js';
import type { V2ContainerMeta } from '../interfaces';
import type { V2InnerBuilder } from '../interfaces';
import { resolveAccentColor } from './resolve-accent-color.util';

/**
 * Assembles a Discord `ContainerBuilder` from V2 metadata and a list of child components.
 *
 * @throws {Error} If a bare `ThumbnailBuilder` is passed as a top-level child.
 *   Discord's Components V2 spec does not allow thumbnails at the container
 *   level - they must be wrapped as an accessory of a `SectionBuilder`
 *   (`@V2Section({ thumbnail: ... })`). Previously such inputs were silently
 *   dropped from the output, which hid the bug.
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
    } else if (component instanceof ThumbnailBuilder) {
      throw new Error(
        '[V2] ThumbnailBuilder cannot be a direct child of @V2Container. ' +
          'Discord requires thumbnails to be attached as a section accessory. ' +
          'Use `@V2Section({ text: "...", thumbnail: { url: "..." } })` instead.',
      );
    }
  }
  return builder;
}
