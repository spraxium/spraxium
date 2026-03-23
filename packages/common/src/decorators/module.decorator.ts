import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { ModuleMetadata } from '../interfaces/module-metadata.interface';

export function Module(metadata: ModuleMetadata = {}): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.MODULE, metadata, target);
  };
}