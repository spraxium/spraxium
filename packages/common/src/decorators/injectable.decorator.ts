import { METADATA_KEYS } from '../constants/metadata-keys.constant';

export function Injectable(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}
