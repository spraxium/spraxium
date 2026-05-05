import 'reflect-metadata';
import { WEBHOOK_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { SendMethodMetadata } from '../interfaces/send-method-metadata.interface';

/**
 * Marks a method inside a `@WebhookSender()` class as an auto-dispatch sender.
 *
 * When the decorated method is called, the framework interceptor executes it and
 * then forwards its return value to the named webhook automatically:
 * - `string` return → sent as message content
 * - `EmbedBuilder` return → sent as a single embed
 * - `MessageCreateOptions` return → forwarded as-is to the webhook client
 *
 * The original return value is preserved and returned to the caller.
 *
 * @param webhookName - The alias defined in `defineWebhook({ webhooks: { ... } })`.
 *
 * @example
 * @Send('alerts')
 * async buildAlert(): Promise<string> {
 *   return `Server alert at ${new Date().toISOString()}`;
 * }
 */
export function Send(webhookName: string): MethodDecorator {
  return (target, propertyKey, _descriptor) => {
    const meta: SendMethodMetadata = { webhookName };
    Reflect.defineMetadata(WEBHOOK_METADATA_KEYS.SEND, meta, target as object, propertyKey);
  };
}
