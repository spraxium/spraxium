import type {
  V2ActionRowConfig,
  V2DynamicChildSpec,
  V2MediaGalleryConfig,
  V2MediaGalleryItem,
  V2SectionConfig,
  V2SeparatorConfig,
  V2TextDisplayConfig,
} from '../interfaces';

/**
 * Creates a text display child spec for use inside `@V2Dynamic` factories.
 */
export function v2text(content: V2TextDisplayConfig['content']): V2DynamicChildSpec {
  return { type: 'textDisplay', config: { content } };
}

/**
 * Creates a separator child spec for use inside `@V2Dynamic` factories.
 */
export function v2sep(config: V2SeparatorConfig = {}): V2DynamicChildSpec {
  return { type: 'separator', config: { divider: true, ...config } satisfies V2SeparatorConfig };
}

/** Alias for `v2sep`. */
export const v2separator = v2sep;

/**
 * Creates a section child spec for use inside `@V2Dynamic` factories.
 */
export function v2section(config: V2SectionConfig): V2DynamicChildSpec {
  return { type: 'section', config };
}

/**
 * Creates a media gallery child spec for use inside `@V2Dynamic` factories.
 */
export function v2gallery(items: Array<V2MediaGalleryItem>): V2DynamicChildSpec {
  return { type: 'mediaGallery', config: { items } as V2MediaGalleryConfig };
}

/**
 * Creates an action row child spec for use inside `@V2Dynamic` factories.
 */
export function v2row(config: V2ActionRowConfig): V2DynamicChildSpec {
  return { type: 'actionRow', config };
}
