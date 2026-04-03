import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';

/**
 * Parameter decorator — injects the submitted value of a text field directly
 * into the `handle()` method.
 *
 * For non-text fields, use `@Ctx()` and access `ctx.fields` directly.
 *
 * @example
 * async handle(
 *   @Field('subject') subject: string,
 *   @Field('message') message: string,
 *   @Ctx() ctx: ModalContext,
 * ) { ... }
 */
export function Field(fieldId: string): ParameterDecorator {
  return (target, methodKey, parameterIndex): void => {
    const key = methodKey ?? 'handle';
    const existing: Array<{ index: number; fieldId: string }> =
      Reflect.getMetadata(METADATA_KEYS.MODAL_FIELD_PARAM, target, key) ?? [];
    existing.push({ index: parameterIndex, fieldId });
    Reflect.defineMetadata(METADATA_KEYS.MODAL_FIELD_PARAM, existing, target, key);
  };
}
