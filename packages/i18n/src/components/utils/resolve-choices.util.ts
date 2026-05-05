import type { ModalChoiceItem } from '@spraxium/components';
import { resolveKey } from './resolve-key.util';

export function resolveChoices(choices: Array<ModalChoiceItem>, locale: string): Array<ModalChoiceItem> {
  return choices.map((choice) => {
    if (!choice.i18n) return choice;
    return {
      ...choice,
      label: resolveKey(choice.i18n.label, locale) ?? choice.label,
      description: resolveKey(choice.i18n.description, locale) ?? choice.description,
    };
  });
}
