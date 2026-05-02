import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';

function createFieldParamDecorator(fieldId: string): ParameterDecorator {
  return (target, methodKey, parameterIndex): void => {
    const key = methodKey ?? 'handle';
    const existing: Array<{ index: number; fieldId: string }> =
      Reflect.getMetadata(COMPONENT_METADATA_KEYS.MODAL_FIELD_PARAM, target, key) ?? [];
    existing.push({ index: parameterIndex, fieldId });
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.MODAL_FIELD_PARAM, existing, target, key);
  };
}

/**
 * Parameter decorator that injects the submitted value of a modal field directly
 * into the `handle()` method. Works for any field type; prefer typed variants
 * when the field type is known at compile time.
 *
 * @param fieldId - The property name of the field as declared in the modal component class.
 *
 * @example
 * async handle(
 *   \@ModalField('subject') subject: string,
 *   \@ModalField('message') message: string,
 *   \@Ctx() ctx: ModalContext,
 * ) { ... }
 */
export function ModalField(fieldId: string): ParameterDecorator {
  return createFieldParamDecorator(fieldId);
}

/**
 * @deprecated Use {@link ModalField} or a typed field decorator such as
 * {@link ModalTextField}, {@link ModalStringSelectField}, or
 * {@link ModalCheckboxField} instead.
 *
 * Parameter decorator that injects the submitted value of a field directly
 * into the `handle()` method.
 *
 * @param fieldId - The property name of the field in the modal component class.
 *
 * @example
 * async handle(
 *   \@Field('subject') subject: string,
 *   \@Ctx() ctx: ModalContext,
 * ) { ... }
 */
export function Field(fieldId: string): ParameterDecorator {
  return createFieldParamDecorator(fieldId);
}

/**
 * Parameter decorator that injects the value of a `@ModalInput` (text) field.
 * Resolves to `string` at runtime.
 *
 * @param fieldId - The property name of the field in the modal component class.
 *
 * @example
 * async handle(
 *   \@ModalTextField('subject') subject: string,
 *   \@Ctx() ctx: ModalContext,
 * ) { ... }
 */
export function ModalTextField(fieldId: string): ParameterDecorator {
  return createFieldParamDecorator(fieldId);
}

/**
 * Parameter decorator that injects the selected value(s) of a `@ModalSelect`
 * (string select) field. Resolves to `string | null` for single-select or
 * `string[]` for multi-select.
 *
 * @param fieldId - The property name of the field in the modal component class.
 *
 * @example
 * async handle(
 *   \@ModalStringSelectField('category') category: string | null,
 *   \@Ctx() ctx: ModalContext,
 * ) { ... }
 */
export function ModalStringSelectField(fieldId: string): ParameterDecorator {
  return createFieldParamDecorator(fieldId);
}

/**
 * Parameter decorator that injects the selected user(s) from a `@ModalUserSelect`
 * field. Resolves to a discord.js `User | null` for single-select or `User[]`
 * for multi-select.
 *
 * @param fieldId - The property name of the field in the modal component class.
 *
 * @example
 * async handle(
 *   \@ModalUserSelectField('target') target: User | null,
 *   \@Ctx() ctx: ModalContext,
 * ) { ... }
 */
export function ModalUserSelectField(fieldId: string): ParameterDecorator {
  return createFieldParamDecorator(fieldId);
}

/**
 * Parameter decorator that injects the selected role(s) from a `@ModalRoleSelect`
 * field. Resolves to a discord.js `Role | null` for single-select or `Role[]`
 * for multi-select.
 *
 * @param fieldId - The property name of the field in the modal component class.
 *
 * @example
 * async handle(
 *   \@ModalRoleSelectField('role') role: Role | null,
 *   \@Ctx() ctx: ModalContext,
 * ) { ... }
 */
export function ModalRoleSelectField(fieldId: string): ParameterDecorator {
  return createFieldParamDecorator(fieldId);
}

/**
 * Parameter decorator that injects the selected mentionable(s) from a
 * `@ModalMentionableSelect` field. Resolves to a discord.js `User | Role | null`.
 *
 * @param fieldId - The property name of the field in the modal component class.
 *
 * @example
 * async handle(
 *   \@ModalMentionableSelectField('target') target: User | Role | null,
 *   \@Ctx() ctx: ModalContext,
 * ) { ... }
 */
export function ModalMentionableSelectField(fieldId: string): ParameterDecorator {
  return createFieldParamDecorator(fieldId);
}

/**
 * Parameter decorator that injects the selected channel(s) from a
 * `@ModalChannelSelect` field. Resolves to a discord.js `GuildBasedChannel | null`
 * for single-select or `GuildBasedChannel[]` for multi-select.
 *
 * @param fieldId - The property name of the field in the modal component class.
 *
 * @example
 * async handle(
 *   \@ModalChannelSelectField('channel') channel: GuildBasedChannel | null,
 *   \@Ctx() ctx: ModalContext,
 * ) { ... }
 */
export function ModalChannelSelectField(fieldId: string): ParameterDecorator {
  return createFieldParamDecorator(fieldId);
}

/**
 * Parameter decorator that injects the selected value of a `@ModalRadioGroup` field.
 * Resolves to `string | null`.
 *
 * @param fieldId - The property name of the field in the modal component class.
 *
 * @example
 * async handle(
 *   \@ModalRadioGroupField('plan') plan: string | null,
 *   \@Ctx() ctx: ModalContext,
 * ) { ... }
 */
export function ModalRadioGroupField(fieldId: string): ParameterDecorator {
  return createFieldParamDecorator(fieldId);
}

/**
 * Parameter decorator that injects the selected values of a `@ModalCheckboxGroup`
 * field. Resolves to `string[]`.
 *
 * @param fieldId - The property name of the field in the modal component class.
 *
 * @example
 * async handle(
 *   \@ModalCheckboxGroupField('notifications') notifications: string[],
 *   \@Ctx() ctx: ModalContext,
 * ) { ... }
 */
export function ModalCheckboxGroupField(fieldId: string): ParameterDecorator {
  return createFieldParamDecorator(fieldId);
}

/**
 * Parameter decorator that injects the checked state of a `@ModalCheckbox` field.
 * Resolves to `boolean`.
 *
 * @param fieldId - The property name of the field in the modal component class.
 *
 * @example
 * async handle(
 *   \@ModalCheckboxField('acceptedRules') acceptedRules: boolean,
 *   \@Ctx() ctx: ModalContext,
 * ) { ... }
 */
export function ModalCheckboxField(fieldId: string): ParameterDecorator {
  return createFieldParamDecorator(fieldId);
}

/**
 * Parameter decorator that injects the uploaded file(s) from a `@ModalFileUpload`
 * field. Resolves to a discord.js `Attachment[]`.
 *
 * @param fieldId - The property name of the field in the modal component class.
 *
 * @example
 * async handle(
 *   \@ModalFileUploadField('attachment') files: Attachment[],
 *   \@Ctx() ctx: ModalContext,
 * ) { ... }
 */
export function ModalFileUploadField(fieldId: string): ParameterDecorator {
  return createFieldParamDecorator(fieldId);
}
