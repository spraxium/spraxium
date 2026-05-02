import { Ctx } from '@spraxium/common';
import { type ModalContext, ModalField, ModalHandler, ModalTextField } from '@spraxium/components';
import { SuggestionModal } from '../components/suggestion-modal.component';

@ModalHandler(SuggestionModal)
export class SuggestionModalSubmitCommandHandler {
  async handle(
    @ModalField('title') titleTwo: string,
    @ModalTextField('title') title: string,
    @ModalTextField('details') details: string,
    @ModalTextField('url') url: string,
    @Ctx() ctx: ModalContext,
  ): Promise<void> {
    const uxRating = ctx.fields.getRadioGroup('rate_ux') ?? 'N/A';
    const perfRating = ctx.fields.getRadioGroup('rate_perf') ?? 'N/A';
    const docsRating = ctx.fields.getRadioGroup('rate_docs') ?? 'N/A';

    const lines = [
      '💡 **Suggestion submitted!**',
      `**Title:** ${title}`,
      `**Details:** ${details}`,
      `**UX impact:** ${uxRating}`,
      `**Performance impact:** ${perfRating}`,
      `**Docs impact:** ${docsRating}`,
    ];

    if (url) {
      lines.push(`**Reference:** ${url}`);
    }

    await ctx.reply({ content: lines.join('\n'), flags: 'Ephemeral' });
  }
}
