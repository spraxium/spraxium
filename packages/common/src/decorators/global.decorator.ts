import { METADATA_KEYS } from '../constants/metadata-keys.constant';

export function Global(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.GLOBAL, true, target);
  };
}