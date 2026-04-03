import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys';
import type { ModalComponentMetadata } from '../interfaces';

/**
 * Class decorator — declares a modal builder.
 *
 * @example
 * @ModalComponent({ id: 'feedback', title: 'Share your feedback' })
 * export class FeedbackModal { ... }
 */
export function ModalComponent(config: ModalComponentMetadata): ClassDecorator {
  return (target): void => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.MODAL_COMPONENT, config, target);
  };
}
