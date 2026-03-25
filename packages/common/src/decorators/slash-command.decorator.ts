import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { SlashCommandConfig } from '../interfaces/slash-command-config.interface';

export function SlashCommand(config: SlashCommandConfig): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.SLASH_COMMAND, config, target);
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}
