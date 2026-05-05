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
import type { AnySelectBuilder } from '../../select/types';

export type V2InnerBuilder =
  | TextDisplayBuilder
  | SeparatorBuilder
  | SectionBuilder
  | MediaGalleryBuilder
  | ThumbnailBuilder
  | FileBuilder
  | ActionRowBuilder<ButtonBuilder>
  | ActionRowBuilder<AnySelectBuilder>;
