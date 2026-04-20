import { WithLayout } from '@spraxium/common';
import { SpraxiumException, defineExceptionLayout } from '@spraxium/core';
import { EmbedBuilder } from 'discord.js';

const SuspendedLayout = defineExceptionLayout((ex) => ({
  embeds: [
    new EmbedBuilder()
      .setColor(0xff4444)
      .setTitle('Account Suspended')
      .setDescription(
        `Your account has been suspended.\n\n**Reason:** ${ex.props.reason ?? 'No reason provided'}\n**Expires:** ${ex.props.expiresAt ?? 'Never'}`,
      )
      .setFooter({ text: `Case ID: ${ex.props.caseId}` }),
  ],
  ephemeral: true,
}));

@WithLayout(SuspendedLayout)
export class AccountSuspendedException extends SpraxiumException {
  constructor(props: { reason?: string; expiresAt?: string; caseId: string }) {
    super({
      code: 'ACCOUNT_SUSPENDED',
      message: 'This account is currently suspended.',
      props,
      shouldLog: true,
    });
  }
}
