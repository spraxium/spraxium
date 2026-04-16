import { Ctx } from '@spraxium/common';
import { type ModalContext, ModalHandler } from '@spraxium/components';
import { ProfileModal } from '../modals/profile.modal';

// Handles ProfileModal submission — reads select, radio, checkbox, and boolean fields.

@ModalHandler(ProfileModal)
export class ProfileModalHandler {
  async handle(@Ctx() ctx: ModalContext): Promise<void> {
    const role = ctx.fields.getStringSelectValues('role')[0] ?? 'N/A';
    const timezone = ctx.fields.getRadioGroup('timezone') ?? 'N/A';
    const notifications = ctx.fields.getCheckboxGroup('notifications');
    const acceptedRules = ctx.fields.getCheckbox('acceptedRules');

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
