import { Ctx } from '@spraxium/common';
import { Field, type ModalContext, ModalHandler } from '@spraxium/components';
import { ProfileModal } from '../components/profile.modal.component';

@ModalHandler(ProfileModal)
export class ProfileModalSubmitCommandHandler {
  async handle(
    @Ctx() ctx: ModalContext,
    @Field('role') role: string,
    @Field('timezone') timezone: string,
    @Field('notifications') notifications: string[],
    @Field('acceptedRules') acceptedRules: boolean,
  ): Promise<void> {
    if (!acceptedRules) {
      await ctx.reply({
        content: '❌ You must accept the server rules to complete your profile setup.',
        flags: 'Ephemeral',
      });
      return;
    }

    const notifLabel = notifications.length > 0 ? notifications.join(', ') : 'None';

    await ctx.reply({
      content: [
        '✅ **Profile updated!**',
        `**Role:** ${role}`,
        `**Timezone:** ${timezone}`,
        `**Notifications:** ${notifLabel}`,
        '**Rules accepted:** ✅',
      ].join('\n'),
      flags: 'Ephemeral',
    });
  }
}
