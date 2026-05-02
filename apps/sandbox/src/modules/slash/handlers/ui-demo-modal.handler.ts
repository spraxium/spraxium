import { Ctx } from '@spraxium/common';
import {
  ModalCheckboxGroupField,
  ModalHandler,
  ModalRadioGroupField,
  type ModalContext,
} from '@spraxium/components';
import { UiDemoModal } from '../modals/ui-demo.modal';

@ModalHandler(UiDemoModal)
export class UiDemoModalHandler {
  async handle(
    @Ctx() ctx: ModalContext,
    @ModalRadioGroupField('option') option: string,
    @ModalCheckboxGroupField('preferences') preferences: string[],
  ): Promise<void> {
    await ctx.reply({
      content: [
        '✅ Recebido!',
        `**Opção:** ${option}`,
        `**Preferências:** ${preferences.length > 0 ? preferences.join(', ') : 'N/A'}`,
      ].join('\n'),
      flags: 'Ephemeral',
    });
  }
}
