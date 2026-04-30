import { DynamicButton } from '@spraxium/components';
import type { ButtonRenderConfig } from '@spraxium/components';
import type { PanelCategory } from '../panel.data';

@DynamicButton({ baseId: 'panel-cat', payloadTtl: 300 })
export class CategoryButton {
  static render(cat: PanelCategory): ButtonRenderConfig {
    return {
      label: cat.name,
      style: 'primary',
      emoji: '🏷️',
    };
  }
}
