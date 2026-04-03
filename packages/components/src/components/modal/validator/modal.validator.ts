import 'reflect-metadata';
import type { ModalSubmitInteraction } from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { AnyConstructor } from '../../../types';
import type {
  ModalErrorEmbed,
  ModalFieldMetadata,
  ModalValidationError,
  ModalValidationRule,
} from '../interfaces';

/**
 * Evaluates `@ModalValidate()` rules for every text field on a submitted modal.
 * Called automatically by the framework before `handle()` is invoked.
 */
export class ModalValidatorRunner {
  static validate(
    builderCtor: AnyConstructor,
    interaction: ModalSubmitInteraction,
  ): Array<ModalValidationError> {
    const propertyList: Array<string> =
      Reflect.getMetadata(COMPONENT_METADATA_KEYS.MODAL_FIELDS_LIST, builderCtor) ?? [];
    const proto = builderCtor.prototype as object;
    const errors: Array<ModalValidationError> = [];

    for (const propKey of propertyList) {
      const rules: Array<ModalValidationRule> | undefined = Reflect.getMetadata(
        COMPONENT_METADATA_KEYS.MODAL_VALIDATOR,
        proto,
        propKey,
      );
      if (!rules || rules.length === 0) continue;

      const fieldMeta: ModalFieldMetadata | undefined = Reflect.getMetadata(
        COMPONENT_METADATA_KEYS.MODAL_FIELD,
        proto,
        propKey,
      );
      if (!fieldMeta || fieldMeta.field.type !== 'text') continue;

      const fieldId = fieldMeta.field.id;
      const fieldLabel = fieldMeta.field.label;

      let value = '';
      try {
        value = interaction.fields.getTextInputValue(fieldId);
      } catch {
        continue;
      }

      for (const rule of rules) {
        const result = rule.validate(value);
        if (result !== true) {
          errors.push({ fieldId, label: fieldLabel, value, message: result });
          break;
        }
      }
    }

    return errors;
  }

  static collectAllValues(interaction: ModalSubmitInteraction): Record<string, string> {
    const values: Record<string, string> = {};
    interaction.fields.fields.forEach((component, id) => {
      // biome-ignore lint/suspicious/noExplicitAny: discord.js field component value is untyped at this access level
      const val = (component as any).value as unknown;
      if (typeof val === 'string') {
        values[id] = val;
      }
    });
    return values;
  }
}
