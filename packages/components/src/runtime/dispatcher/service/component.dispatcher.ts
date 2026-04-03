import type { Client } from 'discord.js';
import type { ComponentsConfig } from '../../lifecycle';
import { ButtonDispatcher } from '../components/button.dispatcher';
import { ModalDispatcher } from '../components/modal.dispatcher';
import { SelectDispatcher } from '../components/select.dispatcher';
import { pendingInstances } from './pending.store';

/**
 * Coordinates all component interaction dispatchers (modal, select, button).
 * Processes accumulated handler instances and binds event listeners to the Discord client.
 */
export class ComponentDispatcher {
  private readonly modals = new ModalDispatcher();
  private readonly selects = new SelectDispatcher();
  private readonly buttons = new ButtonDispatcher();

  private config?: ComponentsConfig;

  setConfig(config: ComponentsConfig): void {
    this.config = config;
  }

  get size(): number {
    return this.modals.size + this.selects.size + this.buttons.size;
  }

  /**
   * Drains the pending instances array, registering any that carry
   * component handler metadata with the appropriate sub-dispatcher.
   */
  processPending(): void {
    for (const { ctor, instance } of pendingInstances) {
      this.modals.register(ctor, instance);
      this.selects.register(ctor, instance);
      this.buttons.registerStatic(ctor, instance);
      this.buttons.registerDynamic(ctor, instance);
    }
    pendingInstances.length = 0;
  }

  /** Attaches all registered handlers to the Discord client's event system. */
  bind(client: Client): void {
    if (this.config) {
      this.buttons.setConfig(this.config);
      this.selects.setConfig(this.config);
    }
    this.modals.bind(client, this.config);
    this.selects.bind(client);
    this.buttons.bind(client);
  }
}
