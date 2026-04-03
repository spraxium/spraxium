import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys';
import type { ModalFieldDef } from '../interfaces';

/**
 * Class decorator — marks a modal builder as accepting external runtime data.
 * Purely informational; used for type-safety in `ModalService.build<T>()`.
 *
 * @example
 * @ModalDynamic<{ categories: Array<string> }>()
 * @ModalComponent({ id: 'report', title: 'Report an issue' })
 * export class ReportModal { ... }
 */
export function ModalDynamic<_T = unknown>(): ClassDecorator {
  return (target): void => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.MODAL_DYNAMIC, true, target);
  };
}

/**
 * Method decorator — marks a method as the dynamic field factory.
 * The method receives the runtime data and returns an array of `ModalFieldDef`.
 *
 * @example
 * @ModalDynamicFields()
 * buildFields(data: { categories: Array<string> }): Array<ModalFieldDef> {
 *   return data.categories.map(c => Modal.field.text({ id: c, label: c }));
 * }
 */
export function ModalDynamicFields(): MethodDecorator {
  return (target, propertyKey): void => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.MODAL_DYNAMIC_FIELDS, propertyKey, target.constructor);
  };
}

/**
 * Property decorator — conditionally includes a field based on runtime data.
 *
 * @example
 * @ModalWhen(data => data.allowFiles)
 * @ModalFileUploadField({ label: 'Attachments' })
 * files!: Array<string>;
 */
export function ModalWhen<T = unknown>(predicate: (data: T) => boolean): PropertyDecorator {
  return (target, propertyKey): void => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.MODAL_WHEN, predicate, target, propertyKey);
  };
}

export type { ModalFieldDef };
