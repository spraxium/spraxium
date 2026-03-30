import { Injectable } from '@spraxium/common';
import { logger } from '@spraxium/core';
import type { Message } from 'discord.js';
import { SIGNAL_MESSAGES } from '../constants';
import type { SignalConfig, SignalEnvelope, SignalHandler } from '../interfaces';
import type { NonceCache } from '../security';
import type { SignalRouter } from './signal-router.service';
import type { SignalValidator } from './signal-validator.service';

const CTX = 'SignalProcessor';

@Injectable()
export class SignalProcessor {
  constructor(
    private readonly validator: SignalValidator,
    private readonly router: SignalRouter,
    private readonly nonceCache: NonceCache,
  ) {}

  async process(message: Message, config: SignalConfig): Promise<void> {
    const dbg = config.debug === true;

    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.PROCESSING(message.id, message.webhookId ?? 'none')}`);

    const result = this.validator.validate(message, config, this.router.events());
    if (!result.ok) {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.REJECTED(message.id)}`);
      return;
    }

    const { envelope } = result;

    if (this.nonceCache.has(envelope.nonce)) {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.NONCE_REPLAY(envelope.nonce)}`);
      return;
    }
    this.nonceCache.add(envelope.nonce);

    const handler = this.router.resolve(envelope.event);
    if (!handler) {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.NO_HANDLER(envelope.event)}`);
      return;
    }

    const payload = this.resolvePayload(handler, envelope, dbg);
    if (payload === null) return;

    if (config.deleteAfterProcessing) await this.tryDeleteMessage(message, dbg);

    await this.invokeHandler(handler, payload, envelope, dbg);
  }

  private resolvePayload(handler: SignalHandler, envelope: SignalEnvelope, dbg: boolean): unknown | null {
    if (!handler.schema) {
      if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.ZOD_SKIP}`);
      return envelope.payload;
    }

    const result = handler.schema.safeParse(envelope.payload);
    if (!result.success) {
      if (dbg)
        logger.warn(
          `[${CTX}] ${SIGNAL_MESSAGES.ZOD_FAIL(envelope.event, JSON.stringify(result.error.issues))}`,
        );
      return null;
    }

    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.ZOD_OK}`);
    return result.data;
  }

  private async tryDeleteMessage(message: Message, dbg: boolean): Promise<void> {
    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.DELETING(message.id)}`);
    try {
      await message.delete();
    } catch (err) {
      logger.warn(
        `[${CTX}] ${SIGNAL_MESSAGES.DELETE_FAIL(message.id, err instanceof Error ? err.message : String(err))}`,
      );
    }
  }

  private async invokeHandler(
    handler: SignalHandler,
    payload: unknown,
    envelope: SignalEnvelope,
    dbg: boolean,
  ): Promise<void> {
    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.INVOKING(envelope.event, envelope.guildId)}`);
    try {
      await handler.execute(payload, envelope);
      if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.HANDLER_OK(envelope.event)}`);
    } catch (err) {
      logger.error(
        `[${CTX}] ${SIGNAL_MESSAGES.HANDLER_ERROR(envelope.event, err instanceof Error ? err.message : String(err))}`,
      );
    }
  }
}
