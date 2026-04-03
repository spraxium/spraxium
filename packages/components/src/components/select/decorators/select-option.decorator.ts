import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { SelectOptionConfig } from '../interfaces';

/**
 * Class decorator that adds a selectable option to a `@StringSelect()` component.
 * Stack multiple `@SelectOption()` decorators on the same class to build the option list.
 *
 * @param config Label, value, and optional description or emoji for the option
 */
export function SelectOption(config: SelectOptionConfig): ClassDecorator {
  return (target): void => {
    const existing: Array<SelectOptionConfig> =
      Reflect.getMetadata(COMPONENT_METADATA_KEYS.SELECT_OPTIONS_LIST, target) ?? [];
    existing.push({
      label: config.label,
      value: config.value,
      description: config.description,
      default: config.default,
      emoji: config.emoji,
    });
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.SELECT_OPTIONS_LIST, existing, target);
  };
}
