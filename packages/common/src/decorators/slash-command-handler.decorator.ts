import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { SlashCommandHandlerMetadata } from '../interfaces/slash-command-handler-metadata.interface';

export function SlashCommandHandler(
  command: new () => object,
  options?: { sub?: string; group?: string },
): ClassDecorator {
  return (target) => {
    const meta: SlashCommandHandlerMetadata = {
      command,
      sub: options?.sub,
      group: options?.group,
    };
    Reflect.defineMetadata(METADATA_KEYS.SLASH_COMMAND_HANDLER, meta, target);
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}
