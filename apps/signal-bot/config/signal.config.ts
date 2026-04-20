import { defineSignal } from '@spraxium/signal';

export const signalConfig = defineSignal({
  channelId: process.env.SIGNAL_CHANNEL_ID ?? '',
  allowedWebhookIds: [process.env.SIGNAL_WEBHOOK_ID ?? ''],
  hmacSecret: process.env.SIGNAL_HMAC_SECRET ?? '',
  deleteAfterProcessing: true,
});
