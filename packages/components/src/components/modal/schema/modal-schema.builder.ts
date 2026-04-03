import 'reflect-metadata';
import type { ModalBuilder } from 'discord.js';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { AnyConstructor } from '../../../types';
import type {
  ModalCheckboxGroupFieldDef,
  ModalComponentMetadata,
  ModalFieldDef,
  ModalFieldMetadata,
  ModalRadioGroupFieldDef,
  ModalSchema,
  ModalStringSelectFieldDef,
} from '../interfaces';

export class ModalSchemaBuilder {
  build(
    ModalClass: AnyConstructor,
    // biome-ignore lint/suspicious/noExplicitAny: runtime data object from caller, shape unknown at compile time
    data?: Record<string, any>,
    cachedValues?: Record<string, string>,
  ): ModalSchema {
    const componentMeta: ModalComponentMetadata | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.MODAL_COMPONENT,
      ModalClass,
    );
    if (!componentMeta) {
      throw new Error(
        `${ModalClass.name} is not decorated with @ModalComponent(). Only @ModalComponent()-decorated classes can be passed to ModalService.build().`,
      );
    }

    const textDisplays: Array<{ content: string }> =
      Reflect.getMetadata(COMPONENT_METADATA_KEYS.MODAL_TEXT_DISPLAYS, ModalClass) ?? [];

    const propertyList: Array<string> =
      Reflect.getMetadata(COMPONENT_METADATA_KEYS.MODAL_FIELDS_LIST, ModalClass) ?? [];
    const proto = ModalClass.prototype as object;
    const staticFields: Array<ModalFieldDef> = [];

    for (const propKey of propertyList) {
      const meta: ModalFieldMetadata | undefined = Reflect.getMetadata(
        COMPONENT_METADATA_KEYS.MODAL_FIELD,
        proto,
        propKey,
      );
      if (!meta) continue;

      if (data !== undefined) {
        // biome-ignore lint/suspicious/noExplicitAny: predicate callback shape is user-defined
        const predicate: ((d: any) => boolean) | undefined = Reflect.getMetadata(
          COMPONENT_METADATA_KEYS.MODAL_WHEN,
          proto,
          propKey,
        );
        if (predicate && !predicate(data)) continue;
      }

      const field = ModalSchemaBuilder.mergeChoices(meta);

      const resolvedField: ModalFieldDef =
        cachedValues && field.type === 'text' && cachedValues[field.id] !== undefined
          ? { ...field, value: cachedValues[field.id] }
          : field;

      staticFields.push(resolvedField);
    }

    const dynamicMethodKey: string | undefined = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.MODAL_DYNAMIC_FIELDS,
      ModalClass,
    );
    let dynamicFields: Array<ModalFieldDef> = [];

    if (dynamicMethodKey) {
      const instance = new ModalClass() as Record<string, unknown>;
      const method = instance[dynamicMethodKey];
      if (typeof method === 'function') {
        // biome-ignore lint/suspicious/noExplicitAny: dynamic method result via reflect instantiation
        const result: unknown = (method as (d: any) => unknown).call(instance, data ?? {});
        if (Array.isArray(result)) {
          dynamicFields = (result as Array<ModalFieldDef | null | false>).filter(
            (f): f is ModalFieldDef => f !== null && f !== false,
          );
        }
      }
    }

    if (cachedValues) {
      dynamicFields = dynamicFields.map((f) =>
        f.type === 'text' && cachedValues[f.id] !== undefined
          ? ({ ...f, value: cachedValues[f.id] } as ModalFieldDef)
          : f,
      );
    }

    return {
      id: componentMeta.id,
      title: componentMeta.title,
      textDisplays,
      fields: [...staticFields, ...dynamicFields],
    };
  }

  private static mergeChoices(meta: ModalFieldMetadata): ModalFieldDef {
    const { field, choices } = meta;
    if (choices.length === 0) return field;

    if (field.type === 'radio_group') return { ...(field as ModalRadioGroupFieldDef), choices };
    if (field.type === 'checkbox_group') return { ...(field as ModalCheckboxGroupFieldDef), choices };
    if (field.type === 'string_select') return { ...(field as ModalStringSelectFieldDef), options: choices };
    return field;
  }
}

export type { ModalBuilder };
