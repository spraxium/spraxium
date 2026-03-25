import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { SlashAutocompleteHandlerMetadata } from '../interfaces/slash-autocomplete-handler-metadata.interface';

export function SlashAutocompleteHandler(command: new () => object, optionName: string): ClassDecorator {
  return (target) => {
    const meta: SlashAutocompleteHandlerMetadata = { command, optionName };
    Reflect.defineMetadata(METADATA_KEYS.SLASH_AUTOCOMPLETE_HANDLER, meta, target);
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}
