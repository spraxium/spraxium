import 'reflect-metadata';
import { Inject, Injectable } from '@spraxium/common';
import type { SpraxiumOnBoot, SpraxiumOnShutdown } from '@spraxium/common';
import { ConfigStore, ModuleLoader } from '@spraxium/core';
import { logger } from '@spraxium/logger';
import { Client, type Message } from 'discord.js';
import { SIGNAL_MESSAGES, SIGNAL_METADATA_KEYS } from '../constants';
import type { OnSignalMetadata } from '../interfaces/on-signal-metadata.interface';
import type { SignalConfig } from '../interfaces/signal-config.interface';
import type { SignalEnvelope } from '../interfaces/signal-envelope.interface';
import { NonceCache } from '../security/nonce-cache.service';
import { defineSignal } from '../signal.config';
import { MethodSignalHandler } from './method-signal-handler';
import { SignalProcessor } from './signal-processor.service';
import { SignalRouter } from './signal-router.service';

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
  private bootPromise?: Promise<void>;
  private shutdownPromise?: Promise<void>;

  constructor(
    @Inject(Client) private readonly client: Client,
    @Inject(SignalProcessor) private readonly processor: SignalProcessor,
    @Inject(SignalRouter) private readonly router: SignalRouter,
    @Inject(NonceCache) private readonly nonceCache: NonceCache,
  ) {
    this.scannerFn = this.scan.bind(this);
    ModuleLoader.instanceScanners.add(this.scannerFn);
  }

  onBoot(): Promise<void> {
    if (this.shutdownPromise) return Promise.resolve();
    this.bootPromise ??= this.start();
    return this.bootPromise;
  }

  onShutdown(): Promise<void> {
    this.shutdownPromise ??= this.stop();
    return this.shutdownPromise;
  }

  private async start(): Promise<void> {
    const config: SignalConfig | undefined = ConfigStore.getPluginConfig(defineSignal);

    if (!config) {
      log.warn(SIGNAL_MESSAGES.NO_CONFIG);
      return;
    }

    await this.nonceCache.configure(config);
    if (this.shutdownPromise) return;

    this.messageHandler = this.handleMessage.bind(this, config);
    this.client.on('messageCreate', this.messageHandler);

    const channels = Array.isArray(config.channelId) ? config.channelId.join(', ') : config.channelId;
    log.info(SIGNAL_MESSAGES.LISTENING(channels));
  }

  private async stop(): Promise<void> {
    ModuleLoader.instanceScanners.delete(this.scannerFn);

    if (this.messageHandler) {
      this.client.off('messageCreate', this.messageHandler);
      this.messageHandler = undefined;
    }

    if (this.bootPromise) await Promise.allSettled([this.bootPromise]);
    await this.nonceCache.destroy();
  }

  private handleMessage(config: SignalConfig, message: Message): void {
    void this.processor.process(message, config).catch(this.reportProcessingError);
  }

  private reportProcessingError(): void {
    log.error(SIGNAL_MESSAGES.PROCESSING_FAILED);
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
