import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
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
      Reflect.getMetadata(METADATA_KEYS.SELECT_OPTIONS_LIST, target) ?? [];
    existing.push({
      label: config.label,
      value: config.value,
      description: config.description,
      default: config.default,
      emoji: config.emoji,
    });
    Reflect.defineMetadata(METADATA_KEYS.SELECT_OPTIONS_LIST, existing, target);
  };
}
