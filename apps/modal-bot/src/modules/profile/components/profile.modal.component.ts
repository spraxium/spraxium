import {
  ModalCheckbox,
  ModalCheckboxGroup,
  ModalChoice,
  ModalComponent,
  ModalOption,
  ModalRadioGroup,
  ModalSelect,
  ModalTextDisplay,
} from '@spraxium/components';

@ModalTextDisplay({ content: 'Set up your public profile visible to server members.' })
@ModalComponent({ id: 'profile', title: 'Profile Setup' })
export class ProfileModal {

  @ModalSelect({ label: 'Primary role', placeholder: 'Select your role…', required: true })
  @ModalOption({ label: 'Developer', value: 'dev', emoji: '💻', description: 'Software engineering' })
  @ModalOption({ label: 'Designer', value: 'design', emoji: '🎨', description: 'UI/UX and visual work' })
  @ModalOption({ label: 'DevOps / SRE', value: 'devops', emoji: '⚙️', description: 'Infrastructure and ops' })
  @ModalOption({ label: 'Product Manager', value: 'pm', emoji: '📋', description: 'Planning and strategy' })
  @ModalOption({ label: 'Other', value: 'other', emoji: '👤' })
  role!: string;

  @ModalRadioGroup({ label: 'Timezone', required: true })
  @ModalChoice({ label: 'UTC-5  (Americas East)', value: 'utc-5' })
  @ModalChoice({ label: 'UTC-3  (Brasil / Argentina)', value: 'utc-3', default: true })
  @ModalChoice({ label: 'UTC    (Europe / Africa)', value: 'utc' })
  @ModalChoice({ label: 'UTC+1  (Central Europe)', value: 'utc+1' })
  @ModalChoice({ label: 'UTC+8  (Asia Pacific)', value: 'utc+8' })
  timezone!: string;

  @ModalCheckboxGroup({ label: 'Notification preferences' })
  @ModalChoice({ label: 'DM on ticket updates', value: 'dm_ticket', emoji: '📨' })
  @ModalChoice({ label: 'DM on mentions', value: 'dm_mention', emoji: '🔔' })
  @ModalChoice({ label: 'Weekly activity digest', value: 'digest', emoji: '📰' })
  notifications!: string[];

  @ModalCheckbox({ label: 'I have read and accept the server rules', defaultChecked: false })
  acceptedRules!: boolean;
}
