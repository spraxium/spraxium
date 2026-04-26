import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { AnyConstructor } from '../../../types';
import type { EmbedFieldDef } from '../interfaces';
import type { EmbedFieldConfig } from '../interfaces';
import type { EmbedSchema } from '../interfaces';

function ensureFieldsList(target: object): Array<EmbedFieldDef> {
  const existing = Reflect.getMetadata(COMPONENT_METADATA_KEYS.EMBED_FIELDS_LIST, target) as
    | Array<EmbedFieldDef>
    | undefined;
  if (existing) return existing;
  const fresh: Array<EmbedFieldDef> = [];
  Reflect.defineMetadata(COMPONENT_METADATA_KEYS.EMBED_FIELDS_LIST, fresh, target);
  return fresh;
}

/**
 * Marks a class as a Spraxium embed schema.
 * Can be used bare (`@Embed`) or with options (`@Embed({ ... })`).
 *
 * @example
 * ```ts
 * @Embed
 * export class PingEmbed { ... }
 * ```
 */
export function Embed(target: AnyConstructor): void;
export function Embed(schema?: EmbedSchema): ClassDecorator;
export function Embed(schemaOrTarget?: EmbedSchema | AnyConstructor): ClassDecorator | undefined {
  const apply = (target: AnyConstructor, schema: EmbedSchema) => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.EMBED_COMPONENT, schema, target);
    if (!Reflect.hasMetadata(COMPONENT_METADATA_KEYS.EMBED_FIELDS_LIST, target)) {
      Reflect.defineMetadata(COMPONENT_METADATA_KEYS.EMBED_FIELDS_LIST, [], target);
    }
  };

  if (typeof schemaOrTarget === 'function') {
    apply(schemaOrTarget as unknown as AnyConstructor, {});
    return;
  }

  return (target) => apply(target as unknown as AnyConstructor, schemaOrTarget ?? {});
}

/**
 * Declares an embed field. Fields render in declaration order.
 * Combine with `@EmbedWhen` for conditional fields.
 *
 * @example
 * ```ts
 * @EmbedField<Stats>({ name: 'Score', value: d => code(d.score.toString()), inline: true })
 * score!: never;
 * ```
 */
export function EmbedField<T = unknown>(config: EmbedFieldConfig<T>): PropertyDecorator {
  return (target, propertyKey) => {
    const fields = ensureFieldsList(target.constructor as object);
    fields.push({
      propertyKey: String(propertyKey),
      order: fields.length,
      name: config.name as string | ((data: unknown) => string),
      value: config.value as string | ((data: unknown) => string),
      inline: config.inline,
      i18n: config.i18n,
    });
  };
}

/**
 * Conditionally renders the next `@EmbedField`.
 * Must be placed above `@EmbedField` on the same property.
 *
 * @example
 * ```ts
 * @EmbedWhen<PlayerData>(d => d.rank === 'gold')
 * @EmbedField<PlayerData>({ name: '🏆 Rank', value: d => d.rankLabel })
 * rankBadge!: never;
 * ```
 */
export function EmbedWhen<T = unknown>(predicate: (data: T) => boolean): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(
      `${COMPONENT_METADATA_KEYS.EMBED_WHEN}:${String(propertyKey)}`,
      predicate,
      target.constructor,
    );
  };
}
