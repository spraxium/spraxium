import {
  Modal,
  ModalCheckbox,
  ModalCheckboxGroup,
  ModalChoice,
  ModalComponent,
  ModalDynamic,
  ModalDynamicFields,
  ModalOption,
  ModalRadioGroup,
  ModalSelect,
  ModalInput,
  ModalUserSelect,
  ModalWhen,
  ModalFileUpload,
} from '@spraxium/components';
import type { ModalFieldDef } from '@spraxium/components';

@ModalComponent({ id: 'select_demo', title: 'Select fields demo' })
export class SelectModal {

  @ModalSelect({ label: 'Topic', placeholder: 'Pick a topic…', required: true })
  @ModalOption({ label: 'Bug report', value: 'bug', description: 'Something is broken', emoji: '🐛' })
  @ModalOption({ label: 'Feature request', value: 'feature', description: 'New idea or improvement', emoji: '✨' })
  @ModalOption({ label: 'Question', value: 'question', emoji: '❓' })
  topic!: string;

  @ModalUserSelect({ label: 'Assign to', placeholder: 'Select a member…' })
  assignee!: string;

  @ModalRadioGroup({ label: 'Priority', required: true })
  @ModalChoice({ label: 'Low', value: 'low', emoji: '🟢' })
  @ModalChoice({ label: 'Medium', value: 'medium', default: true, emoji: '🟡' })
  @ModalChoice({ label: 'High', value: 'high', emoji: '🔴' })
  priority!: string;

  @ModalCheckboxGroup({ label: 'Affected areas', minValues: 1 })
  @ModalChoice({ label: 'Commands', value: 'commands', emoji: '⌨️' })
  @ModalChoice({ label: 'Events', value: 'events', emoji: '⚡' })
  @ModalChoice({ label: 'HTTP API', value: 'http', emoji: '🌐' })
  areas!: string[];

  @ModalCheckbox({ label: 'I confirm this is a real issue', defaultChecked: false })
  confirmed!: boolean;
}

export interface DynamicModalData {
  categories: string[];
  allowNote: boolean;
}

@ModalDynamic<DynamicModalData>()
@ModalComponent({ id: 'dynamic_demo', title: 'Dynamic fields demo' })
export class DynamicModal {

  @ModalInput({ label: 'Your name', required: true })
  name!: string;

  @ModalWhen((d: DynamicModalData) => d.allowNote)
  @ModalInput({ label: 'Extra note', style: 'paragraph' })
  note!: string;

  @ModalDynamicFields()
  buildFields(data: DynamicModalData): ModalFieldDef[] {
    return Modal.fields(
      data.categories.map((cat) =>
        Modal.field.radioGroup({
          id: `cat_${cat}`,
          label: `Rate: ${cat}`,
          choices: [
            Modal.choice('Good', 'good'),
            Modal.choice('Needs work', 'needs_work'),
          ],
        }),
      ),
    );
  }
}
