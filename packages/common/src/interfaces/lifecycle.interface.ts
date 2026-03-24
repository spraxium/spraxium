import type { Client } from 'discord.js';

export interface SpraxiumOnBoot {
  onBoot(): void | Promise<void>;
}

export interface SpraxiumOnShutdown {
  onShutdown(): void | Promise<void>;
}

export interface SpraxiumOnReady {
  onReady(client: Client<true>): void | Promise<void>;
}
