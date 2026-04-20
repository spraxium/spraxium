import { Ctx } from '@spraxium/common';
import { ModalHandler, type ModalContext } from '@spraxium/components';
import { SelectModal } from '../modals/component-modals';

@ModalHandler(SelectModal)
export class SelectModalHandler {
  async handle(@Ctx() ctx: ModalContext): Promise<void> {
    const topic = ctx.fields.getStringSelectValues('topic')[0] ?? 'N/A';
    const assignee = ctx.fields.getSelectedUsers('assignee')?.first();
    const priority = ctx.fields.getRadioGroup('priority') ?? 'N/A';
    const areas = ctx.fields.getCheckboxGroup('areas');
    const confirmed = ctx.fields.getCheckbox('confirmed');

    await ctx.reply({
      content: [
        '✅ Received!',
        `**Topic:** ${topic}`,
        `**Assignee:** ${assignee ? assignee.tag : 'N/A'}`,
        `**Priority:** ${priority}`,
        `**Areas:** ${areas.length > 0 ? areas.join(', ') : 'N/A'}`,
        `**Confirmed:** ${confirmed ? 'Yes' : 'No'}`,
      ].join('\n'),
      flags: 'Ephemeral',
    });
  }
}
