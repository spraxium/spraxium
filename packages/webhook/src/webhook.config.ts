import { definePlugin } from '@spraxium/core';
import type { WebhookConfig } from './interfaces/webhook-config.interface';

/**
 * Plugin factory for registering `@spraxium/webhook` in `spraxium.config.ts`.
 *
 * @example
 * ```ts
 * import { defineWebhook } from '@spraxium/webhook';
 *
 * export default defineConfig({
 *   plugins: [
 *     defineWebhook({
 *       webhooks: {
 *         alerts: process.env.WEBHOOK_ALERTS ?? '',
 *         logs: process.env.WEBHOOK_LOGS ?? '',
 *       },
 *       globalUsername: 'MyBot',
 *     }),
 *   ],
 * });
 * ```
 */
export const defineWebhook = definePlugin<'webhook', WebhookConfig>('webhook');
