import { DynamicButton } from '@spraxium/components';
import type { ButtonRenderConfig } from '@spraxium/components';
import type { ColorOption } from '../wizard.data';

@DynamicButton({ baseId: 'wizard-color', payloadTtl: 600 })
export class PickColorButton {
  static render(option: ColorOption): ButtonRenderConfig {
    return {
      label: option.name,
      style: 'secondary',
      emoji: '🎨',
    };
  }
}
