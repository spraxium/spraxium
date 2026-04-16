import { Ctx } from '@spraxium/common';
import { Field, type ModalContext, ModalHandler } from '@spraxium/components';
import { SuggestionModal } from '../components/suggestion-modal.component';

@ModalHandler(SuggestionModal)
export class SuggestionModalHandler {
  async handle(
    @Field('title') title: string,
    @Field('details') details: string,
    @Field('url') url: string,
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
