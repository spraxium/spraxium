import {
  V2Container,
  V2Dynamic,
  V2DynamicRow,
  V2Row,
  V2Separator,
  V2Text,
  V2When,
  desc,
  v2row,
  v2text,
} from '@spraxium/components';
import { AddCategoryButton } from '../components/add-category-button.component';
import { CategoryButton } from '../components/category-button.component';
import { CategorySelect } from '../components/category-select.component';
import type { PanelTemplate } from '../panel.data';

@V2Container({ accentColor: 0xf1c40f })
export class PanelContainer {
  @V2Text((data: PanelTemplate) => `## ${data.title}`)
  title!: never;

  @V2Text((data: PanelTemplate) => data.description)
  description!: never;

  @V2Separator()
  divider!: never;

  @V2When((data: PanelTemplate) => data.categories.length === 0)
  @V2Dynamic(() => [
    v2text(desc().subtext('This panel has no categories yet. Press **Add Category** below to get started.')),
    v2row({ components: [AddCategoryButton] }),
  ])
  emptyState!: never;

  @V2When((data: PanelTemplate) => data.type === 'select' && data.categories.length > 0)
  @V2Row({
    components: [CategorySelect],
    rowData: (data: PanelTemplate) => data.categories,
  })
  categorySelect!: never;

  @V2When((data: PanelTemplate) => data.type === 'buttons' && data.categories.length > 0)
  @V2DynamicRow({
    dynamic: CategoryButton,
    items: (data: PanelTemplate) => data.categories,
  })
  categoryButtons!: never;
}
