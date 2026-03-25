import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

// biome-ignore lint/suspicious/noExplicitAny: group classes have unknown constructors
export function SlashSubcommandGroups(groups: Array<new (...args: any[]) => unknown>): ClassDecorator {
  return (target: object): void => {
    Reflect.defineMetadata(METADATA_KEYS.SLASH_SUBCOMMAND_GROUPS, groups, target);
  };
}
