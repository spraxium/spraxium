import { Ctx } from '@spraxium/common';
import { Field, ModalHandler, type ModalContext } from '@spraxium/components';
import { FeedbackModal } from '../modals/text-modals';

@ModalHandler(FeedbackModal)
export class FeedbackModalHandler {
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
