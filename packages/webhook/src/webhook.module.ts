import { Global, Module } from '@spraxium/common';
import { WebhookLifecycle } from './runtime/webhook.lifecycle';
import { WebhookRegistry } from './runtime/webhook.registry';
import { WebhookService } from './runtime/webhook.service';

@Global()
@Module({
  providers: [WebhookRegistry, WebhookService, WebhookLifecycle],
  exports: [WebhookService],
})
export class WebhookModule {}
