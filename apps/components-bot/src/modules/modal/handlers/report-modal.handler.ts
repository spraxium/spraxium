import { Ctx } from '@spraxium/common';
import { Field, type ModalContext, ModalHandler } from '@spraxium/components';
import { ReportModal } from '../components/report-modal.component';

@ModalHandler(ReportModal)
export class ReportModalHandler {
  async handle(
    @Field('description') description: string,
    @Field('email') email: string,
    @Ctx() ctx: ModalContext,
  ): Promise<void> {
    await ctx.reply({
      content: `✅ Report received!\n**Description:** ${description}${email ? `\n**Contact:** ${email}` : ''}`,
      flags: 'Ephemeral',
    });
  }
}
