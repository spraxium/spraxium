import {
  Modal,
  ModalComponent,
  ModalDynamic,
  ModalDynamicFields,
  ModalInput,
  ModalWhen,
} from '@spraxium/components';
import type { ModalFieldDef } from '@spraxium/components';
import type { SuggestionData } from '../interfaces/suggestion-data.interface';

@ModalDynamic<SuggestionData>()
@ModalComponent({ id: 'suggestion', title: 'Submit a Suggestion' })
export class SuggestionModal {
  @ModalInput({ label: 'Title', placeholder: 'Short description', required: true, maxLength: 100 })
  title!: string;

  @ModalInput({ label: 'Details', style: 'paragraph', placeholder: 'Explain your idea...', required: true })
  details!: string;

  @ModalWhen((d: SuggestionData) => d.includeUrl)
  @ModalInput({ label: 'Reference URL', placeholder: 'https://...' })
  url!: string;

  @ModalDynamicFields()
  buildRatingFields(data: SuggestionData): ModalFieldDef[] {
    return Modal.fields(
      data.categories.map((cat) =>
        Modal.field.radioGroup({
          id: `rate_${cat.id}`,
          label: `Impact on: ${cat.label}`,
          choices: [
            Modal.choice('Low', 'low'),
            Modal.choice('Medium', 'medium'),
            Modal.choice('High', 'high'),
          ],
        }),
      ),
    );
  }
}
