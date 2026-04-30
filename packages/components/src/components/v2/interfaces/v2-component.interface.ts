import type { SeparatorSpacingSize } from 'discord.js';
import type { V2SectionI18nKeys, V2TextDisplayI18nKeys } from '../../../interfaces';
import type { AnyConstructor } from '../../../types';
import type { DescriptionBuilder } from '../../embed';

export type V2ChildType =
  | 'textDisplay'
  | 'section'
  | 'separator'
  | 'mediaGallery'
  | 'thumbnail'
  | 'file'
  | 'actionRow'
  | 'dynamic'
  | 'dynamicRow';

export interface V2TextDisplayConfig {
  // biome-ignore lint/suspicious/noExplicitAny: generic callable type required
  content: string | DescriptionBuilder | ((data: any) => string | DescriptionBuilder);
  i18n?: V2TextDisplayI18nKeys;
}

export interface V2MediaGalleryItem {
  url: string;
  description?: string;
  spoiler?: boolean;
}

export interface V2MediaGalleryConfig {
  // biome-ignore lint/suspicious/noExplicitAny: generic callable type required
  items: Array<V2MediaGalleryItem> | ((data: any) => Array<V2MediaGalleryItem>);
}

export interface V2SectionConfig {
  // biome-ignore lint/suspicious/noExplicitAny: generic callable type required
  text: string | DescriptionBuilder | ((data: any) => string | DescriptionBuilder);
  button?: AnyConstructor;
  thumbnail?: V2ThumbnailConfig;
  i18n?: V2SectionI18nKeys;
}

export interface V2SeparatorConfig {
  divider?: boolean;
  spacing?: SeparatorSpacingSize;
}

export interface V2ThumbnailConfig {
  // biome-ignore lint/suspicious/noExplicitAny: generic callable type required
  url: string | ((data: any) => string);
  description?: string;
  spoiler?: boolean;
}

export interface V2FileConfig {
  // biome-ignore lint/suspicious/noExplicitAny: generic callable type required
  url: string | ((data: any) => string);
  spoiler?: boolean;
}

export interface V2ActionRowConfig {
  // biome-ignore lint/suspicious/noExplicitAny: factory receives caller-defined data types
  components: Array<AnyConstructor> | ((data: any) => Array<AnyConstructor>);
  // biome-ignore lint/suspicious/noExplicitAny: factory receives caller-defined data types
  rowData?: unknown | ((data: any) => unknown);
}

export type V2DynamicChildSpec =
  | { type: 'textDisplay'; config: V2TextDisplayConfig }
  | { type: 'separator'; config: V2SeparatorConfig }
  | { type: 'section'; config: V2SectionConfig }
  | { type: 'mediaGallery'; config: V2MediaGalleryConfig }
  | { type: 'thumbnail'; config: V2ThumbnailConfig }
  | { type: 'file'; config: V2FileConfig }
  | { type: 'actionRow'; config: V2ActionRowConfig };

export interface V2DynamicConfig {
  // biome-ignore lint/suspicious/noExplicitAny: generic callable type required
  factory: (data: any) => Array<V2DynamicChildSpec>;
}

/**
 * Configuration for `@V2DynamicRow` — auto-chunked rows of dynamic buttons.
 *
 * Provide either:
 *  - `dynamic` + `items`: render N items through a `@DynamicButton` class
 *    (auto-chunked into rows of 5).
 *  - `components`: a factory returning an array of `@Button` classes — these
 *    are also auto-chunked into rows of 5.
 */
export interface V2DynamicRowConfig {
  /** A `@DynamicButton`-decorated class. Each item produces one button. */
  dynamic?: AnyConstructor;
  // biome-ignore lint/suspicious/noExplicitAny: factory receives caller-defined data types
  items?: ((data: any) => ReadonlyArray<unknown>) | ReadonlyArray<unknown>;
  /** Or a factory returning a list of `@Button` classes (chunked into rows of 5). */
  // biome-ignore lint/suspicious/noExplicitAny: factory receives caller-defined data types
  components?: ((data: any) => Array<AnyConstructor>) | Array<AnyConstructor>;
}

export interface V2ChildDef {
  type: V2ChildType;
  propertyKey: string;
  order: number;
  config:
    | V2TextDisplayConfig
    | V2MediaGalleryConfig
    | V2SectionConfig
    | V2SeparatorConfig
    | V2ThumbnailConfig
    | V2FileConfig
    | V2ActionRowConfig
    | V2DynamicConfig
    | V2DynamicRowConfig;
  // biome-ignore lint/suspicious/noExplicitAny: generic callable type required
  when?: (data: any) => boolean;
}

export interface V2ContainerMeta {
  accentColor?: number | string;
  spoiler?: boolean;
}

export interface V2SectionFluentConfig {
  text: string;
  button?: AnyConstructor;
}
