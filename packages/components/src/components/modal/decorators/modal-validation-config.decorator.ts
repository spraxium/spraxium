import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type { ModalValidationOptions } from '../interfaces';

/**
 * Class decorator — configures the validation error response for a modal.
 *
 * @example
 * @ModalValidationConfig({
 *   ephemeral: true,
 *   embed: (errors) => ({
 *     title: '❌ Fix the following issues',
 *     description: errors.map(e => `• **${e.label}**: ${e.message}`).join('\n'),
 *     color: 0xed4245,
 *   }),
 * })
 */
export function ModalValidationConfig(options: ModalValidationOptions): ClassDecorator {
  return (target): void => {
    Reflect.defineMetadata(METADATA_KEYS.MODAL_VALIDATION_CONFIG, options, target);
  };
}
