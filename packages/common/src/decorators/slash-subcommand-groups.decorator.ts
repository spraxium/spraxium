import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

export function SlashSubcommandGroups(
  groups: Array<new (...args: Array<unknown>) => unknown>,
): ClassDecorator {
  return (target: object): void => {
    Reflect.defineMetadata(METADATA_KEYS.SLASH_SUBCOMMAND_GROUPS, groups, target);
  };
}
