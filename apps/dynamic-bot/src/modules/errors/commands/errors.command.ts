import { SlashCommand } from '@spraxium/common';

@SlashCommand({
  name: 'errors',
  description: 'Demo: button.onErrorReply, global onError, payloadExpired.',
})
export class ErrorsCommand {}
