export { WebhookModule } from './webhook.module';
export { defineWebhook } from './webhook.config';

export { WebhookSender, Send } from './decorators';

export { WebhookRegistry } from './runtime/webhook.registry';
export { WebhookService } from './runtime/webhook.service';
export { WebhookLifecycle } from './runtime/webhook.lifecycle';

export type { WebhookConfig } from './interfaces/webhook-config.interface';
export type { WebhookEntry } from './interfaces/webhook-entry.interface';
export type { SendOptions } from './interfaces/send-options.interface';
export type { SendMethodMetadata } from './interfaces/send-method-metadata.interface';

export { WEBHOOK_METADATA_KEYS } from './constants/metadata-keys.constant';
