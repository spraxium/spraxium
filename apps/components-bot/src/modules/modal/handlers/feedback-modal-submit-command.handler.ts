import { Ctx } from '@spraxium/common';
import { type ModalContext, ModalHandler, ModalTextField } from '@spraxium/components';
import { FeedbackModal } from '../components/feedback-modal.component';

@ModalHandler(FeedbackModal)
export class FeedbackModalSubmitCommandHandler {
  async handle(
    @ModalTextField('subject') subject: string,
    @ModalTextField('message') message: string,
    @Ctx() ctx: ModalContext,
  ): Promise<void> {
    await ctx.reply({
      content: `✅ Thanks for your feedback!\n**Subject:** ${subject}\n**Message:** ${message}`,
      flags: 'Ephemeral',
    });
  }
}
