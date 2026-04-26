import { Inject, Injectable } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import type { EmbedBuilder, MessageCreateOptions } from 'discord.js';
import { MESSAGES } from '../constants/messages.constant';
import type { SendOptions } from '../interfaces/send-options.interface';
import type { WebhookEntry } from '../interfaces/webhook-entry.interface';
import { WebhookRegistry } from './webhook.registry';

@Injectable()
export class WebhookService {
  private readonly log = new Logger('WebhookService');

  constructor(@Inject(WebhookRegistry) private readonly registry: WebhookRegistry) {}

  /**
   * Sends a plain text message to a named webhook.
   *
   * @param name - Webhook alias defined in `defineWebhook`.
   * @param content - Text content of the message.
   * @param options - Optional per-send overrides (username, avatarURL, threadId).
   */
  async send(name: string, content: string, options?: SendOptions): Promise<void> {
    const entry = this.resolveOrThrow(name);
    await this.dispatch(name, entry, { content, ...this.buildOptions(options) });
  }

  /**
   * Sends an embed to a named webhook.
   *
   * @param name - Webhook alias defined in `defineWebhook`.
   * @param embed - A Discord.js `EmbedBuilder` instance.
   * @param options - Optional per-send overrides.
   */
  async sendEmbed(name: string, embed: EmbedBuilder, options?: SendOptions): Promise<void> {
    const entry = this.resolveOrThrow(name);
    await this.dispatch(name, entry, { embeds: [embed], ...this.buildOptions(options) });
  }

  /**
   * Sends multiple embeds in a single message to a named webhook.
   *
   * @param name - Webhook alias defined in `defineWebhook`.
   * @param embeds - Array of `EmbedBuilder` instances (max 10 per Discord limits).
   * @param options - Optional per-send overrides.
   */
  async sendEmbeds(name: string, embeds: Array<EmbedBuilder>, options?: SendOptions): Promise<void> {
    const entry = this.resolveOrThrow(name);
    await this.dispatch(name, entry, { embeds, ...this.buildOptions(options) });
  }

  /**
   * Sends a fully constructed `MessageCreateOptions` payload to a named webhook.
   * Use this for advanced messages with files, components, or allowed mentions.
   *
   * @param name - Webhook alias defined in `defineWebhook`.
   * @param message - Raw Discord.js message options.
   * @param options - Optional per-send overrides.
   */
  async sendMessage(name: string, message: MessageCreateOptions, options?: SendOptions): Promise<void> {
    const entry = this.resolveOrThrow(name);
    await this.dispatch(name, entry, { ...message, ...this.buildOptions(options) });
  }

  /**
   * Sends a text message to multiple named webhooks in parallel.
   * Errors from individual webhooks are caught and logged without stopping the others.
   *
   * @param names - Array of webhook aliases.
   * @param content - Text content to broadcast.
   * @param options - Optional per-send overrides applied to all targets.
   */
  async sendMany(names: Array<string>, content: string, options?: SendOptions): Promise<void> {
    await Promise.allSettled(names.map((name) => this.send(name, content, options))).then((results) => {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'rejected') {
          this.log.error(`sendMany failed for webhook "${names[i]}": ${String(result.reason)}`);
        }
      }
    });
  }

  /**
   * Broadcasts a text message to every registered webhook in parallel.
   * Individual failures are caught and logged without stopping the broadcast.
   *
   * @param content - Text content to broadcast.
   * @param options - Optional per-send overrides applied to all targets.
   */
  async sendAll(content: string, options?: SendOptions): Promise<void> {
    const names = this.registry.registered();
    if (names.length === 0) {
      this.log.warn('sendAll called but no webhooks are registered.');
      return;
    }
    await this.sendMany(names, content, options);
  }

  /**
   * Interpolates a template string with the provided variables and sends the result.
   *
   * Template syntax uses `{{variableName}}` placeholders.
   *
   * @param name - Webhook alias defined in `defineWebhook`.
   * @param template - Template string with `{{key}}` placeholders.
   * @param vars - Map of variable names to their string values.
   * @param options - Optional per-send overrides.
   *
   * @example
   * await webhookService.formatAndSend(
   *   'alerts',
   *   'Guild {{guildName}} just reached {{memberCount}} members!',
   *   { guildName: guild.name, memberCount: String(guild.memberCount) },
   * );
   */
  async formatAndSend(
    name: string,
    template: string,
    vars: Record<string, string>,
    options?: SendOptions,
  ): Promise<void> {
    const content = this.format(template, vars);
    await this.send(name, content, options);
  }

  /**
   * Interpolates a template string with the provided variables and returns the result.
   * Does not send anything — useful for building content before branching send logic.
   *
   * @param template - Template string with `{{key}}` placeholders.
   * @param vars - Map of variable names to their string values.
   */
  format(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);
  }

  /**
   * Returns the raw `WebhookEntry` for a registered webhook.
   * Use this when you need direct access to the underlying `WebhookClient`.
   *
   * @param name - Webhook alias.
   */
  get(name: string): WebhookEntry | undefined {
    return this.registry.get(name);
  }

  /**
   * Returns `true` if the given webhook alias is registered and ready to use.
   *
   * @param name - Webhook alias.
   */
  isRegistered(name: string): boolean {
    return this.registry.isRegistered(name);
  }

  /**
   * Returns all registered webhook aliases.
   */
  registered(): Array<string> {
    return this.registry.registered();
  }
  
  private resolveOrThrow(name: string): WebhookEntry {
    const entry = this.registry.get(name);
    if (!entry) {
      throw new Error(MESSAGES.WEBHOOK_NOT_FOUND(name));
    }
    return entry;
  }

  private buildOptions(options?: SendOptions): Record<string, string | undefined> {
    if (!options) return {};
    const out: Record<string, string | undefined> = {};
    if (options.username) out.username = options.username;
    if (options.avatarURL) out.avatarURL = options.avatarURL;
    if (options.threadId) out.threadId = options.threadId;
    return out;
  }

  private async dispatch(
    name: string,
    entry: WebhookEntry,
    payload: MessageCreateOptions & Record<string, unknown>,
  ): Promise<void> {
    try {
      await entry.client.send(payload);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.log.error(MESSAGES.WEBHOOK_SEND_ERROR(name));
      const handler = this.registry.getErrorHandler();
      if (handler) {
        handler(name, err);
      } else {
        throw err;
      }
    }
  }
}
