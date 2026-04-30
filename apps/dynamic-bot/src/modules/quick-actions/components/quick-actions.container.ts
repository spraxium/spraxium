import { V2Container, V2DynamicRow, V2Row, V2Separator, V2Text, desc } from '@spraxium/components';
import type { QuickActionsData } from '../quick-actions.data';
import {
  ArchiveButton,
  DeleteButton,
  ExportButton,
  ModeSelect,
  MuteButton,
  PinButton,
  RefreshButton,
  ShareButton,
} from './quick-actions.components';

@V2Container({ accentColor: 0x57f287 })
export class QuickActionsContainer {
  @V2Text((data: QuickActionsData) => desc().h2(`⚡ Quick actions for ${data.resource}`))
  title!: never;

  @V2Separator()
  divider!: never;

  @V2DynamicRow({
    components: () => [
      RefreshButton,
      ExportButton,
      ShareButton,
      ArchiveButton,
      DeleteButton,
      PinButton,
      MuteButton,
    ],
  })
  actions!: never;

  @V2Row({ components: [ModeSelect] })
  mode!: never;
}
