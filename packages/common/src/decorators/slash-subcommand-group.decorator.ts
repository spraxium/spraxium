import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { SlashSubcommandGroupMetadata } from '../interfaces/slash-subcommand-metadata.interface';

export function SlashSubcommandGroup(options: SlashSubcommandGroupMetadata): ClassDecorator {
  return (target: object): void => {
    Reflect.defineMetadata(METADATA_KEYS.SLASH_SUBCOMMAND_GROUP, options, target);
  };
}
