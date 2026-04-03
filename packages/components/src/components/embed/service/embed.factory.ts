import { EmbedBuilder } from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { AnyConstructor } from '../../../types';
import type { DescriptionBuilder } from '../builder';
import type {
  EmbedAuthorConfig,
  EmbedDescriptionDef,
  EmbedFieldDef,
  EmbedFooterConfig,
  EmbedSchema,
} from '../interfaces';
import { ColorResolver } from '../utils';

/**
 * Builds an `EmbedBuilder` from an `@Embed`-decorated schema class and runtime data.
 * Property decorators take precedence over schema options set in `@Embed({ ... })`.
 */
export class EmbedFactory {
  static build<T = unknown>(EmbedClass: AnyConstructor, data?: T): EmbedBuilder {
    const schema = EmbedFactory.getSchema(EmbedClass);
    const builder = new EmbedBuilder();
    const d = data as unknown;

    EmbedFactory.applyTitle(builder, EmbedClass, schema, d);
    EmbedFactory.applyColor(builder, EmbedClass, schema, d);
    EmbedFactory.applyUrl(builder, EmbedClass, schema, d);
    EmbedFactory.applyTimestamp(builder, EmbedClass, schema, d);
    EmbedFactory.applyThumbnail(builder, EmbedClass, schema, d);
    EmbedFactory.applyImage(builder, EmbedClass, schema, d);
    EmbedFactory.applyAuthor(builder, EmbedClass, schema, d);
    EmbedFactory.applyFooter(builder, EmbedClass, schema, d);
    EmbedFactory.applyDescription(builder, EmbedClass, schema, d);
    EmbedFactory.applyFields(builder, EmbedClass, d);

    return builder;
  }

  private static getSchema(EmbedClass: AnyConstructor): EmbedSchema {
    const schema = Reflect.getMetadata(COMPONENT_METADATA_KEYS.EMBED_COMPONENT, EmbedClass) as
      | EmbedSchema
      | undefined;
    if (!schema) throw new Error(`[EmbedService] ${EmbedClass.name} is not decorated with @Embed().`);
    return schema;
  }

  private static prop<V>(EmbedClass: AnyConstructor, key: string): V | undefined {
    return Reflect.getMetadata(key, EmbedClass) as V | undefined;
  }

  private static resolve<V>(val: V | ((d: unknown) => V), data: unknown): V {
    return typeof val === 'function' ? (val as (d: unknown) => V)(data) : val;
  }

  private static applyTitle(
    builder: EmbedBuilder,
    EmbedClass: AnyConstructor,
    schema: EmbedSchema,
    d: unknown,
  ): void {
    const val =
      EmbedFactory.prop<string | ((d: unknown) => string)>(EmbedClass, COMPONENT_METADATA_KEYS.EMBED_TITLE) ??
      schema.title;
    if (val) builder.setTitle(EmbedFactory.resolve(val, d));
  }

  private static applyColor(
    builder: EmbedBuilder,
    EmbedClass: AnyConstructor,
    schema: EmbedSchema,
    d: unknown,
  ): void {
    const val =
      EmbedFactory.prop<number | string | ((d: unknown) => number | string)>(
        EmbedClass,
        COMPONENT_METADATA_KEYS.EMBED_COLOR,
      ) ?? schema.color;
    if (val !== undefined) builder.setColor(ColorResolver.resolve(EmbedFactory.resolve(val, d)));
  }

  private static applyUrl(
    builder: EmbedBuilder,
    EmbedClass: AnyConstructor,
    schema: EmbedSchema,
    d: unknown,
  ): void {
    const val =
      EmbedFactory.prop<string | ((d: unknown) => string)>(EmbedClass, COMPONENT_METADATA_KEYS.EMBED_URL) ??
      schema.url;
    if (val) builder.setURL(EmbedFactory.resolve(val, d));
  }

  private static applyTimestamp(
    builder: EmbedBuilder,
    EmbedClass: AnyConstructor,
    schema: EmbedSchema,
    d: unknown,
  ): void {
    const val =
      EmbedFactory.prop<boolean | Date | ((d: unknown) => Date)>(
        EmbedClass,
        COMPONENT_METADATA_KEYS.EMBED_TIMESTAMP,
      ) ?? schema.timestamp;
    if (!val) return;
    if (typeof val === 'function') builder.setTimestamp(val(d));
    else if (val instanceof Date) builder.setTimestamp(val);
    else builder.setTimestamp();
  }

  private static applyThumbnail(
    builder: EmbedBuilder,
    EmbedClass: AnyConstructor,
    schema: EmbedSchema,
    d: unknown,
  ): void {
    const val =
      EmbedFactory.prop<string | ((d: unknown) => string)>(
        EmbedClass,
        COMPONENT_METADATA_KEYS.EMBED_THUMBNAIL,
      ) ?? schema.thumbnail;
    if (val) builder.setThumbnail(EmbedFactory.resolve(val, d));
  }

  private static applyImage(
    builder: EmbedBuilder,
    EmbedClass: AnyConstructor,
    schema: EmbedSchema,
    d: unknown,
  ): void {
    const val =
      EmbedFactory.prop<string | ((d: unknown) => string)>(EmbedClass, COMPONENT_METADATA_KEYS.EMBED_IMAGE) ??
      schema.image;
    if (val) builder.setImage(EmbedFactory.resolve(val, d));
  }

  private static applyAuthor(
    builder: EmbedBuilder,
    EmbedClass: AnyConstructor,
    schema: EmbedSchema,
    d: unknown,
  ): void {
    const val =
      EmbedFactory.prop<EmbedAuthorConfig | ((d: unknown) => EmbedAuthorConfig)>(
        EmbedClass,
        COMPONENT_METADATA_KEYS.EMBED_AUTHOR,
      ) ?? schema.author;
    if (!val) return;
    const cfg = EmbedFactory.resolve(val, d);
    builder.setAuthor({ name: cfg.name, iconURL: cfg.iconUrl, url: cfg.url });
  }

  private static applyFooter(
    builder: EmbedBuilder,
    EmbedClass: AnyConstructor,
    schema: EmbedSchema,
    d: unknown,
  ): void {
    const raw =
      EmbedFactory.prop<string | EmbedFooterConfig | ((d: unknown) => string | EmbedFooterConfig)>(
        EmbedClass,
        COMPONENT_METADATA_KEYS.EMBED_FOOTER,
      ) ?? schema.footer;
    if (raw === undefined) return;
    const resolved = EmbedFactory.resolve(raw, d);
    const cfg: EmbedFooterConfig = typeof resolved === 'string' ? { text: resolved } : resolved;
    builder.setFooter({ text: cfg.text, iconURL: cfg.iconUrl });
  }

  private static applyDescription(
    builder: EmbedBuilder,
    EmbedClass: AnyConstructor,
    schema: EmbedSchema,
    d: unknown,
  ): void {
    const descDef = Reflect.getMetadata(COMPONENT_METADATA_KEYS.EMBED_DESCRIPTION_FIELD, EmbedClass) as
      | EmbedDescriptionDef
      | undefined;
    if (descDef) {
      const raw = EmbedFactory.resolve(descDef.value, d);
      builder.setDescription(raw?.toString() ?? '');
      return;
    }
    if (schema.description) {
      const raw = EmbedFactory.resolve(
        schema.description as string | ((d: unknown) => string | DescriptionBuilder),
        d,
      );
      builder.setDescription(raw.toString());
    }
  }

  private static applyFields(builder: EmbedBuilder, EmbedClass: AnyConstructor, d: unknown): void {
    const fieldDefs = (Reflect.getMetadata(COMPONENT_METADATA_KEYS.EMBED_FIELDS_LIST, EmbedClass) ??
      []) as Array<EmbedFieldDef>;
    const sorted = [...fieldDefs].sort((a, b) => a.order - b.order);

    for (const field of sorted) {
      const when = Reflect.getMetadata(
        `${COMPONENT_METADATA_KEYS.EMBED_WHEN}:${field.propertyKey}`,
        EmbedClass,
      ) as ((d: unknown) => boolean) | undefined;
      if (when && !when(d)) continue;

      const name = EmbedFactory.resolve(field.name, d);
      const value = EmbedFactory.resolve(field.value, d);
      if (!name || !value) continue;

      builder.addFields({ name, value, inline: field.inline });
    }
  }
}
