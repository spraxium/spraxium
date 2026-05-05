import { DynamicStringSelect } from '@spraxium/components';
import type { SelectRenderConfig } from '@spraxium/components';
import type { PanelCategory } from '../panel.data';

@DynamicStringSelect({ baseId: 'panel-category', placeholder: 'Choose a category…', payloadTtl: 300 })
export class CategorySelect {
  static render(categories: PanelCategory[]): SelectRenderConfig {
    return {
      options: categories.map((cat) => ({ label: cat.name, value: cat.id })),
    };
  }
}
