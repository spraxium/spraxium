import { Inject, Injectable } from '@spraxium/common';
import type { SpraxiumOnBoot } from '@spraxium/common';
import { ConfigStore } from '@spraxium/core';
import { Client } from 'discord.js';
import { defineComponents } from '../../components.config';
import { ModalFieldCache } from '../../components/modal/cache';
import { ComponentDispatcher } from '../dispatcher';
import { initContextAdapter } from './context-adapter.factory';

/**
 * Lifecycle hook that initializes the component dispatcher on application boot.
 * Processes pending instances and binds interaction listeners to the Discord client.
 */
@Injectable()
export class ComponentLifecycle implements SpraxiumOnBoot {
  private readonly dispatcher = new ComponentDispatcher();

  constructor(@Inject(Client) private readonly client: Client) {}

  async onBoot(): Promise<void> {
    const config = ConfigStore.getPluginConfig(defineComponents);
    if (config) this.dispatcher.setConfig(config);

    await initContextAdapter(config?.context?.storage, config?.context?.defaultTtl);

    // Modal validation prefill cache shares the component context adapter so
    // half-submitted modals survive restarts. Hydrate before processing
    // pending instances so the first buildFor() call after boot sees the
    // persisted entries.
    ModalFieldCache.bindStore();
    await ModalFieldCache.hydrate();

    this.dispatcher.processPending();

    if (this.dispatcher.size > 0) {
      this.dispatcher.bind(this.client);
    }
  }
}
