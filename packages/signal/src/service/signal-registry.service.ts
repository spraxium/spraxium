import 'reflect-metadata';
import { Inject, Injectable } from '@spraxium/common';
import type { SpraxiumOnBoot, SpraxiumOnShutdown } from '@spraxium/common';
import { ConfigStore, ModuleLoader } from '@spraxium/core';
import { logger } from '@spraxium/logger';
import type { Client, Message } from 'discord.js';
import { SIGNAL_MESSAGES, SIGNAL_METADATA_KEYS } from '../constants';
import type { OnSignalMetadata, SignalConfig, SignalEnvelope } from '../interfaces';
import { defineSignal } from '../signal.config';
import { MethodSignalHandler } from './method-signal-handler';
import type { SignalProcessor } from './signal-processor.service';
import type { SignalRouter } from './signal-router.service';

const CTX = 'SignalRegistry';
const log = logger.child(CTX);

/**
 * Discovers `@SignalListener()` classes, extracts `@OnSignal()` methods,
 * and wires the Discord `messageCreate` event on boot.
 */
@Injectable()
export class SignalRegistry implements SpraxiumOnBoot, SpraxiumOnShutdown {
  private readonly scannerFn: (instance: unknown) => void;
  private messageHandler: ((message: Message) => void) | undefined;

  constructor(
    @Inject('Client') private readonly client: Client,
    private readonly processor: SignalProcessor,
    private readonly router: SignalRouter,
  ) {
    this.scannerFn = this.scan.bind(this);
    ModuleLoader.instanceScanners.add(this.scannerFn);
  }

  async onBoot(): Promise<void> {
    const config: SignalConfig | undefined = ConfigStore.getPluginConfig(defineSignal);

    if (!config) {
      log.warn(SIGNAL_MESSAGES.NO_CONFIG);
      return;
    }

    this.messageHandler = (message: Message): void => {
      this.processor.process(message, config).catch(() => {});
    };

    this.client.on('messageCreate', this.messageHandler);

    const channels = Array.isArray(config.channelId) ? config.channelId.join(', ') : config.channelId;
    log.info(SIGNAL_MESSAGES.LISTENING(channels));
  }

  async onShutdown(): Promise<void> {
    ModuleLoader.instanceScanners.delete(this.scannerFn);

    if (this.messageHandler) {
      this.client.off('messageCreate', this.messageHandler);
      this.messageHandler = undefined;
    }
  }

  private scan(instance: unknown): void {
    if (!instance || typeof instance !== 'object') return;

    const proto = Object.getPrototypeOf(instance) as object;
    const ctor = (proto as { constructor: object }).constructor;

    const isListener: boolean = Reflect.getMetadata(SIGNAL_METADATA_KEYS.SIGNAL_LISTENER, ctor) ?? false;

    if (!isListener) return;

    const methods: Array<string | symbol> =
      Reflect.getMetadata(SIGNAL_METADATA_KEYS.ON_SIGNAL_LIST, proto) ?? [];

    for (const method of methods) {
      const meta: OnSignalMetadata | undefined = Reflect.getMetadata(
        SIGNAL_METADATA_KEYS.ON_SIGNAL,
        proto,
        method,
      );

      if (!meta) continue;

      const fn = (instance as Record<string | symbol, unknown>)[method];
      if (typeof fn !== 'function') continue;

      const handler = new MethodSignalHandler(
        meta.event,
        meta.schema,
        (fn as (payload: unknown, envelope: SignalEnvelope) => Promise<void>).bind(instance),
      );

      this.router.register(meta.event, handler);
      logger.info(`[${CTX}] ${SIGNAL_MESSAGES.HANDLER_REGISTERED(meta.event)}`);
    }
  }
}
