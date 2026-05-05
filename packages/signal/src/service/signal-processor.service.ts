import { Injectable } from '@spraxium/common';
import { logger } from '@spraxium/logger';
import type { Message } from 'discord.js';
import { SIGNAL_MESSAGES } from '../constants';
import type { SignalConfig, SignalEnvelope, SignalHandler } from '../interfaces';
import type { NonceCache } from '../security';
import type { SignalRouter } from './signal-router.service';
import type { SignalValidator } from './signal-validator.service';

const CTX = 'SignalProcessor';
const log = logger.child(CTX);

@Injectable()
export class SignalProcessor {
  constructor(
    private readonly validator: SignalValidator,
    private readonly router: SignalRouter,
    private readonly nonceCache: NonceCache,
  ) {}

  async process(message: Message, config: SignalConfig): Promise<void> {
    const dbg = config.debug === true;

    if (dbg) log.info(SIGNAL_MESSAGES.PROCESSING(message.id, message.webhookId ?? 'none'));

    const result = this.validator.validate(message, config, this.router.events());
    if (!result.ok) {
      if (dbg) log.warn(SIGNAL_MESSAGES.REJECTED(message.id));
      return;
    }

    const { envelope } = result;

    const isNew = await this.nonceCache.addIfAbsent(envelope.nonce);
    if (!isNew) {
      if (dbg) log.warn(SIGNAL_MESSAGES.NONCE_REPLAY(envelope.nonce));
      return;
    }

    const handlers = this.router.resolveAll(envelope.event);
    if (handlers.length === 0) {
      if (dbg) log.warn(SIGNAL_MESSAGES.NO_HANDLER(envelope.event));
      return;
    }

    if (config.deleteAfterProcessing) await this.tryDeleteMessage(message, dbg);

    await Promise.allSettled(
      handlers.map(async (handler) => {
        const payload = this.resolvePayload(handler, envelope, dbg);
        if (payload !== null) await this.invokeHandler(handler, payload, envelope, dbg);
      }),
    );
  }

  private resolvePayload(handler: SignalHandler, envelope: SignalEnvelope, dbg: boolean): unknown | null {
    if (!handler.schema) {
      if (dbg) log.info(SIGNAL_MESSAGES.ZOD_SKIP);
      return envelope.payload;
    }

    const result = handler.schema.safeParse(envelope.payload);
    if (!result.success) {
      if (dbg) log.warn(SIGNAL_MESSAGES.ZOD_FAIL(envelope.event, JSON.stringify(result.error.issues)));
      return null;
    }

    if (dbg) log.info(SIGNAL_MESSAGES.ZOD_OK);
    return result.data;
  }

  private async tryDeleteMessage(message: Message, dbg: boolean): Promise<void> {
    if (dbg) log.info(SIGNAL_MESSAGES.DELETING(message.id));
    try {
      await message.delete();
    } catch (err) {
      log.warn(SIGNAL_MESSAGES.DELETE_FAIL(message.id, err instanceof Error ? err.message : String(err)));
    }
  }

  private async invokeHandler(
    handler: SignalHandler,
    payload: unknown,
    envelope: SignalEnvelope,
    dbg: boolean,
  ): Promise<void> {
    if (dbg) log.info(SIGNAL_MESSAGES.INVOKING(envelope.event, envelope.guildId));
    try {
      await handler.execute(payload, envelope);
      if (dbg) log.info(SIGNAL_MESSAGES.HANDLER_OK(envelope.event));
    } catch (err) {
      log.error(
        SIGNAL_MESSAGES.HANDLER_ERROR(envelope.event, err instanceof Error ? err.message : String(err)),
      );
    }
  }
}
