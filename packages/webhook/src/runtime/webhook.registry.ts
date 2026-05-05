import 'reflect-metadata';
import { Injectable } from '@spraxium/common';
import { ConfigStore, ModuleLoader } from '@spraxium/core';
import { ANSI, logger } from '@spraxium/logger';
import { WebhookClient } from 'discord.js';
import { MESSAGES } from '../constants/messages.constant';
import { WEBHOOK_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { SendMethodMetadata } from '../interfaces/send-method-metadata.interface';
import type { WebhookEntry } from '../interfaces/webhook-entry.interface';
import { defineWebhook } from '../webhook.config';

@Injectable()
export class WebhookRegistry {
  private readonly log = logger.child('WebhookRegistry');
  private readonly entries = new Map<string, WebhookEntry>();
  private readonly scannerFn: (instance: unknown) => void;
  private errorHandler?: (name: string, error: Error) => void;
  private _globalUsername: string | undefined;
  private _globalAvatarUrl: string | undefined;

  constructor() {
    this.scannerFn = this.scan.bind(this);
    ModuleLoader.instanceScanners.add(this.scannerFn);
  }

  /** Default `username` applied to every send that omits the field. */
  get globalUsername(): string | undefined {
    return this._globalUsername;
  }

  /** Default `avatarURL` applied to every send that omits the field. */
  get globalAvatarUrl(): string | undefined {
    return this._globalAvatarUrl;
  }

  boot(): void {
    const config = ConfigStore.getPluginConfig(defineWebhook);

    if (!config || Object.keys(config.webhooks).length === 0) {
      this.log.warn(MESSAGES.NO_WEBHOOKS);
      return;
    }

    if (config.onError) {
      this.errorHandler = config.onError;
    }

    this._globalUsername = config.globalUsername;
    this._globalAvatarUrl = config.globalAvatarUrl;

    for (const [name, url] of Object.entries(config.webhooks)) {
      if (!url) {
        this.log.warn(`Webhook "${name}" has an empty URL and will be skipped.`);
        continue;
      }
      try {
        const client = new WebhookClient({ url });
        this.entries.set(name, { name, url, client });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.log.warn(`Webhook "${name}" has an invalid URL and will be skipped: ${message}`);
      }
    }

    this.log.raw(`${ANSI.green('+')}  ${MESSAGES.WEBHOOK_LOADED(this.entries.size)}`);
  }

  shutdown(): void {
    ModuleLoader.instanceScanners.delete(this.scannerFn);

    for (const entry of this.entries.values()) {
      entry.client.destroy();
    }

    this.entries.clear();
    this.log.debug(MESSAGES.WEBHOOK_DESTROYED);
  }

  get(name: string): WebhookEntry | undefined {
    return this.entries.get(name);
  }

  getAll(): Array<WebhookEntry> {
    return Array.from(this.entries.values());
  }

  registered(): Array<string> {
    return Array.from(this.entries.keys());
  }

  isRegistered(name: string): boolean {
    return this.entries.has(name);
  }

  getErrorHandler(): ((name: string, error: Error) => void) | undefined {
    return this.errorHandler;
  }

  /**
   * Returns a plain object with the registered global username/avatar values,
   * omitting keys that are not configured. Used by `@Send`-patched methods.
   */
  private buildGlobalOptions(): Record<string, string> {
    const out: Record<string, string> = {};
    if (this._globalUsername) out.username = this._globalUsername;
    if (this._globalAvatarUrl) out.avatarURL = this._globalAvatarUrl;
    return out;
  }

  /**
   * Scans each DI-instantiated class decorated with `@WebhookSender()` and wraps
   * any method decorated with `@Send(name)` to auto-dispatch the return value.
   */
  private scan(instance: unknown): void {
    if (!instance || typeof instance !== 'object') return;

    const proto = Object.getPrototypeOf(instance) as object;
    const isSender = Reflect.getMetadata(WEBHOOK_METADATA_KEYS.SENDER, proto.constructor) as
      | boolean
      | undefined;

    if (!isSender) return;

    const methods = Object.getOwnPropertyNames(proto).filter((m) => m !== 'constructor');
    for (const method of methods) {
      this.patchIfSend(instance as Record<string, unknown>, proto, method);
    }
  }

  private patchIfSend(instance: Record<string, unknown>, proto: object, method: string): void {
    const meta = Reflect.getMetadata(WEBHOOK_METADATA_KEYS.SEND, proto, method) as
      | SendMethodMetadata
      | undefined;

    if (!meta) return;

    // Guard against double-wrapping if scan() is called more than once on the
    // same instance (e.g. hot-reload or test re-wiring). Without this check
    // the method would be wrapped twice, causing two webhook sends per call.
    const current = instance[method] as ((...args: unknown[]) => Promise<unknown>) & {
      __spraxiumPatched?: true;
    };
    if (current.__spraxiumPatched) return;

    const original = current;

    instance[method] = async (...args: unknown[]): Promise<unknown> => {
      const result = await original.apply(instance, args);

      if (result == null) return result;

      const entry = this.get(meta.webhookName);
      if (!entry) {
        this.log.warn(MESSAGES.WEBHOOK_NOT_FOUND(meta.webhookName));
        return result;
      }

      const globals = this.buildGlobalOptions();
      try {
        if (typeof result === 'string') {
          await entry.client.send({ content: result, ...globals });
        } else if (
          typeof result === 'object' &&
          'data' in (result as object) &&
          'toJSON' in (result as object)
        ) {
          // EmbedBuilder (has .data and .toJSON from discord.js)
          await entry.client.send({ embeds: [result as never], ...globals });
        } else if (typeof result === 'object') {
          // Per-call fields in the returned payload take precedence over globals.
          await entry.client.send({ ...globals, ...(result as object) } as never);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.log.error(MESSAGES.WEBHOOK_SEND_ERROR(meta.webhookName));
        const handler = this.getErrorHandler();
        if (handler) {
          handler(meta.webhookName, err);
        } else {
          throw err;
        }
      }

      return result;
    };

    // Mark the wrapper so a second scan() call on the same instance is a no-op.
    (instance[method] as { __spraxiumPatched?: true }).__spraxiumPatched = true;
  }
}
