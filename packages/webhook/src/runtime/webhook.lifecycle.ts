import { Inject, Injectable } from '@spraxium/common';
import type { SpraxiumOnBoot, SpraxiumOnShutdown } from '@spraxium/common';
import { WebhookRegistry } from './webhook.registry';

@Injectable()
export class WebhookLifecycle implements SpraxiumOnBoot, SpraxiumOnShutdown {
  constructor(@Inject(WebhookRegistry) private readonly registry: WebhookRegistry) {}

  async onBoot(): Promise<void> {
    this.registry.boot();
  }

  async onShutdown(): Promise<void> {
    this.registry.shutdown();
  }
}
