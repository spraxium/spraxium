import { Inject, Injectable, type SpraxiumOnBoot, type SpraxiumOnShutdown } from '@spraxium/common';
import { StorageRegistry } from './storage.registry';

@Injectable()
export class StorageLifecycle implements SpraxiumOnBoot, SpraxiumOnShutdown {
  constructor(@Inject(StorageRegistry) private readonly registry: StorageRegistry) {}

  async onBoot(): Promise<void> {
    await this.registry.initialize();
  }

  async onShutdown(): Promise<void> {
    await this.registry.shutdown();
  }
}
