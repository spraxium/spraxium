import 'reflect-metadata';
import { Injectable } from '@spraxium/common';
import { WEBHOOK_METADATA_KEYS } from '../constants/metadata-keys.constant';

/**
 * Marks a class as a webhook sender.
 * Automatically applies `@Injectable()` so the class is resolved by the DI container.
 *
 * Combine with `@Send(name)` on methods to auto-dispatch return values to named webhooks.
 *
 * @example
 * @WebhookSender()
 * export class ReportsService {
 *   @Send('reports')
 *   async buildDailyReport(): Promise<string> {
 *     return `Daily report for ${new Date().toDateString()}`;
 *   }
 * }
 */
export function WebhookSender(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(WEBHOOK_METADATA_KEYS.SENDER, true, target);
    Injectable()(target);
  };
}
