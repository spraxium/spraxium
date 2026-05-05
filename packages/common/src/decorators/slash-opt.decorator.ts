import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

/**
 * Parameter decorator that injects a resolved slash command option value
 * into a handler method parameter.
 *
 * @deprecated Use {@link SlashOption} as a parameter decorator instead:
 * `@SlashOption('name')`. For strongly-typed variants, prefer
 * `@SlashStringOption`, `@SlashIntegerOption`, etc.
 * `@SlashOpt` will be removed in a future major version.
 *
 * @param name - The option name as declared in `@SlashOption.*`.
 *
 * @example
 * async handle(
 *   \@Ctx() interaction: ChatInputCommandInteraction,
 *   \@SlashOpt('message') message: string | null,
 * ): Promise<void> {
 *   await interaction.reply(message ?? '');
 * }
 */
const _warnedSlashOpt = new Set<string>();

export function SlashOpt(name: string): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    if (propertyKey === undefined) return;

    const site = `${(target as { constructor: { name: string } }).constructor.name}:${String(propertyKey)}:${parameterIndex}`;
    if (!_warnedSlashOpt.has(site)) {
      _warnedSlashOpt.add(site);
      console.warn(
        `[Spraxium] @SlashOpt('${name}') is deprecated - use @SlashOption('${name}') or a typed decorator such as @SlashStringOption('${name}') instead. ` +
          `Found in ${(target as { constructor: { name: string } }).constructor.name}.${String(propertyKey)}`,
      );
    }

    const existing: Array<{ index: number; name: string }> =
      Reflect.getMetadata(METADATA_KEYS.SLASH_OPT_PARAM, target, propertyKey) ?? [];

    Reflect.defineMetadata(
      METADATA_KEYS.SLASH_OPT_PARAM,
      [...existing, { index: parameterIndex, name }],
      target,
      propertyKey,
    );
  };
}
