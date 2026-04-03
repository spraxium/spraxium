import 'reflect-metadata';
import { Injectable } from '@spraxium/common';
import type { SpraxiumOnBoot, SpraxiumOnReady, SpraxiumOnShutdown } from '@spraxium/common';
import type { Client } from 'discord.js';
// biome-ignore lint/style/useImportType: runtime reference required for DI reflection
import { ScheduleRegistry } from './schedule.registry';

@Injectable()
export class ScheduleLifecycle implements SpraxiumOnBoot, SpraxiumOnReady, SpraxiumOnShutdown {
  constructor(private readonly registry: ScheduleRegistry) {}

  async onBoot(): Promise<void> {
    await this.registry.boot();
  }

  async onReady(_client: Client<true>): Promise<void> {
    await this.registry.ready();
  }

  async onShutdown(): Promise<void> {
    await this.registry.shutdown();
  }
}
