import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys';
import type { DescriptionBuilder } from '../builder';
import type { EmbedDescriptionDef } from '../interfaces';

/**
 * Marks a property as the dynamic description of an `@Embed` class.
 * Takes precedence over `description` set in `@Embed({ ... })`.
 *
 * @example
 * ```ts
 * @EmbedDescription<ProfileData>(d => desc().line(`Bio: ${d.bio}`).build())
 * description!: never;
 * ```
 */
export function EmbedDescription<T = unknown>(
  value: string | ((data: T) => string | DescriptionBuilder),
): PropertyDecorator {
  return (target, propertyKey) => {
    const def: EmbedDescriptionDef = {
      propertyKey: String(propertyKey),
      value: value as string | ((data: unknown) => string | DescriptionBuilder),
    };
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.EMBED_DESCRIPTION_FIELD, def, target.constructor);
  };
}
