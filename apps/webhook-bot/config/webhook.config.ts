import { defineWebhook } from '@spraxium/webhook';

export const webhookConfig = defineWebhook({
  webhooks: {
    alerts: process.env.WEBHOOK_ALERTS ?? '',
    logs: process.env.WEBHOOK_LOGS ?? '',
    reports: process.env.WEBHOOK_REPORTS ?? '',
  },
  globalUsername: 'Spraxium Bot',
  onError: (name, error) => {
    console.error(`[webhook] Failed to send to "${name}":`, error.message);
  },
});
