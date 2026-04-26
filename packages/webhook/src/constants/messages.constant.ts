export const MESSAGES = {
  WEBHOOK_NOT_FOUND: (name: string) =>
    `Webhook "${name}" is not registered. Check your defineWebhook config in spraxium.config.ts.`,
  WEBHOOK_SEND_ERROR: (name: string) => `Failed to send to webhook "${name}".`,
  NO_WEBHOOKS:
    'No webhooks configured. Add entries via defineWebhook({ webhooks: { ... } }) in spraxium.config.ts.',
  WEBHOOK_LOADED: (count: number) => `webhook loaded, ${count} webhook(s) registered.`,
  WEBHOOK_DESTROYED: 'All webhook clients destroyed.',
} as const;
