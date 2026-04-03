import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
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
    Reflect.defineMetadata(METADATA_KEYS.MODAL_COMPONENT, config, target);
  };
}
