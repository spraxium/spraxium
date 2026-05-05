import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { ModalCacheConfig } from '../interfaces';

/**
 * Class decorator that enables per-user field-value caching on a modal builder.
 *
 * When active and a submission fails validation, submitted values are stored for
 * `ttl` seconds. The next call to `ModalService.buildFor()` will pre-fill them.
 * The cache is cleared when `handle()` runs successfully.
 *
 * @example
 * @ModalCache({ ttl: 300 })
 * @ModalComponent({ id: 'feedback', title: 'Feedback' })
 * export class FeedbackModal { ... }
 */
export function ModalCache(config: ModalCacheConfig): ClassDecorator {
  return (target): void => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.MODAL_CACHE_CONFIG, config, target);
  };
}
