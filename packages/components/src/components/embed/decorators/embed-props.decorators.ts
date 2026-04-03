import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys';
import type { EmbedAuthorConfig, EmbedFooterConfig } from '../interfaces';

/**
 * Sets the embed title.
 *
 * @example
 * ```ts
 * @EmbedTitle<StatsData>(d => `📊 Stats for ${d.username}`)
 * _title!: never;
 * ```
 */
export function EmbedTitle<T = unknown>(value: string | ((data: T) => string)): PropertyDecorator {
  return (target) => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.EMBED_TITLE, value, target.constructor);
  };
}

/**
 * Sets the embed accent color.
 * Accepts a hex number, hex string, or a factory.
 *
 * @example
 * ```ts
 * @EmbedColor<PingData>(d => ColorResolver.step(d.latency, [...], Colors.Red))
 * _color!: never;
 * ```
 */
export function EmbedColor<T = unknown>(
  value: number | string | ((data: T) => number | string),
): PropertyDecorator {
  return (target) => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.EMBED_COLOR, value, target.constructor);
  };
}

/**
 * Sets the embed footer. Accepts a plain string or a `{ text, iconUrl }` config.
 *
 * @example
 * ```ts
 * @EmbedFooter('Spraxium bot')
 * _footer!: never;
 * ```
 */
export function EmbedFooter<T = unknown>(
  value: string | EmbedFooterConfig | ((data: T) => string | EmbedFooterConfig),
): PropertyDecorator {
  return (target) => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.EMBED_FOOTER, value, target.constructor);
  };
}

/**
 * Stamps the embed with a timestamp. Omit the argument for "now".
 *
 * @example
 * ```ts
 * @EmbedTimestamp()
 * _timestamp!: never;
 * ```
 */
export function EmbedTimestamp<T = unknown>(value?: boolean | Date | ((data: T) => Date)): PropertyDecorator {
  return (target) => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.EMBED_TIMESTAMP, value ?? true, target.constructor);
  };
}

/**
 * Sets the embed author block.
 *
 * @example
 * ```ts
 * @EmbedAuthor<UserData>(d => ({ name: d.username, iconUrl: d.avatarUrl }))
 * _author!: never;
 * ```
 */
export function EmbedAuthor<T = unknown>(
  value: EmbedAuthorConfig | ((data: T) => EmbedAuthorConfig),
): PropertyDecorator {
  return (target) => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.EMBED_AUTHOR, value, target.constructor);
  };
}

/**
 * Sets the embed thumbnail (top-right small image).
 */
export function EmbedThumbnail<T = unknown>(value: string | ((data: T) => string)): PropertyDecorator {
  return (target) => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.EMBED_THUMBNAIL, value, target.constructor);
  };
}

/**
 * Sets the embed main image (full-width below fields).
 */
export function EmbedImage<T = unknown>(value: string | ((data: T) => string)): PropertyDecorator {
  return (target) => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.EMBED_IMAGE, value, target.constructor);
  };
}

/**
 * Sets the embed URL (attached to the title).
 */
export function EmbedUrl<T = unknown>(value: string | ((data: T) => string)): PropertyDecorator {
  return (target) => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.EMBED_URL, value, target.constructor);
  };
}
