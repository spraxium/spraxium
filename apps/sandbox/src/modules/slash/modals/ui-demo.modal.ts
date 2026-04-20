import {
  ModalCheckboxGroup,
  ModalChoice,
  ModalComponent,
  ModalRadioGroup,
} from '@spraxium/components';

@ModalComponent({ id: 'ui_demo', title: 'Demo — Radio & Checkbox' })
export class UiDemoModal {
  @ModalRadioGroup({ label: 'Opção preferida', required: true })
  @ModalChoice({ label: 'Opção A', value: 'a', default: true })
  @ModalChoice({ label: 'Opção B', value: 'b' })
  @ModalChoice({ label: 'Opção C', value: 'c' })
  option!: string;

  @ModalCheckboxGroup({ label: 'Preferências', minValues: 1 })
  @ModalChoice({ label: 'Notificações por DM', value: 'dm_notify', default: true })
  @ModalChoice({ label: 'Mencionar @everyone', value: 'everyone_mention' })
  @ModalChoice({ label: 'Modo silencioso', value: 'silent_mode' })
  preferences!: string[];
}
