import type {
  ActionRowBuilder,
  ButtonBuilder,
  FileBuilder,
  MediaGalleryBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from 'discord.js';

export type V2InnerBuilder =
  | TextDisplayBuilder
  | SeparatorBuilder
  | SectionBuilder
  | MediaGalleryBuilder
  | ThumbnailBuilder
  | FileBuilder
  | ActionRowBuilder<ButtonBuilder>;
