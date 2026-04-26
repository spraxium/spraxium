import { Ctx } from '@spraxium/common';
import { Field, type ModalContext, ModalHandler } from '@spraxium/components';
import { FeedbackModal } from '../components/feedback-modal.component';

@ModalHandler(FeedbackModal)
export class FeedbackModalSubmitCommandHandler {
  async handle(
    @Field('subject') subject: string,
    @Field('message') message: string,
    @Ctx() ctx: ModalContext,
  ): Promise<void> {
    await ctx.reply({
      content: `✅ Thanks for your feedback!\n**Subject:** ${subject}\n**Message:** ${message}`,
      flags: 'Ephemeral',
    });
  }
}
