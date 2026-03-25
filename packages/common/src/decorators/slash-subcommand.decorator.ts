import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { SlashSubcommandMetadata } from '../interfaces/slash-subcommand-metadata.interface';

export function SlashSubcommand(options: SlashSubcommandMetadata): MethodDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(METADATA_KEYS.SLASH_SUBCOMMAND, options, target, propertyKey);

    const existing: Array<{ method: string | symbol; meta: SlashSubcommandMetadata }> =
      Reflect.getMetadata(METADATA_KEYS.SLASH_SUBCOMMANDS_LIST, target.constructor) ?? [];

    Reflect.defineMetadata(
      METADATA_KEYS.SLASH_SUBCOMMANDS_LIST,
      [...existing, { method: propertyKey, meta: options }],
      target.constructor,
    );
  };
}
