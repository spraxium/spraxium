import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type { ModalValidationRule } from '../interfaces';

/**
 * Property decorator — attaches validation rules to a modal text field.
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
    Reflect.defineMetadata(METADATA_KEYS.MODAL_VALIDATOR, rules, target, propertyKey);
  };
}
