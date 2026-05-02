import { Ctx } from '@spraxium/common';
import {
  ModalCheckboxField,
  ModalCheckboxGroupField,
  type ModalContext,
  ModalHandler,
  ModalRadioGroupField,
  ModalStringSelectField,
} from '@spraxium/components';
import { ProfileModal } from '../components/profile.modal.component';

@ModalHandler(ProfileModal)
export class ProfileModalSubmitCommandHandler {
  async handle(
    @Ctx() ctx: ModalContext,
    @ModalStringSelectField('role') role: string,
    @ModalRadioGroupField('timezone') timezone: string,
    @ModalCheckboxGroupField('notifications') notifications: string[],
    @ModalCheckboxField('acceptedRules') acceptedRules: boolean,
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
