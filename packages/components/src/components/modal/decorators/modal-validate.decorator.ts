import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { ModalValidationRule } from '../interfaces';

/**
 * Property decorator that attaches validation rules to a modal text field.
 *
 * Define your rules in a dedicated validators file and import them here.
 *
 * @example
 * // validators/feedback.validators.ts
 * export const subjectRules = [minWords(3), matchesPattern(/^[A-Za-z]/, '...')];
 *
 * // feedback.modal.ts
 * @ModalValidate(subjectRules)
 * @ModalInput({ label: 'Subject' })
 * subject!: string;
 */
export function ModalValidate(rules: Array<ModalValidationRule>): PropertyDecorator {
  return (target, propertyKey): void => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.MODAL_VALIDATOR, rules, target, propertyKey);
  };
}
