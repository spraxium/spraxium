import { Injectable } from '@spraxium/common';
import { logger } from '@spraxium/core';
import type { Message } from 'discord.js';
import { MAX_CLOCK_SKEW_MS, SIGNAL_MESSAGES } from '../constants';
import type { SignalConfig, SignalEnvelope } from '../interfaces';
import { HmacService } from '../security';
import type { ValidationResult } from '../types';

const CTX = 'SignalValidator';

@Injectable()
export class SignalValidator {
  validate(message: Message, config: SignalConfig, knownEvents: ReadonlySet<string>): ValidationResult {
    const dbg = config.debug === true;

    if (dbg)
      logger.info(
        `[${CTX}] ${SIGNAL_MESSAGES.V_INCOMING(message.id, message.channelId, message.webhookId ?? 'none', message.content.slice(0, 120))}`,
      );

    if (!this.validateSource(message, config, dbg)) return { ok: false };

    const envelope = this.parseAndVerify(message.content, config.hmacSecret, knownEvents, dbg);
    if (!envelope) return { ok: false };

    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.V_ALL_OK(envelope.event)}`);
    return { ok: true, envelope };
  }

  private validateSource(message: Message, config: SignalConfig, dbg: boolean): boolean {
    if (!message.webhookId) {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.V_R1_FAIL}`);
      return false;
    }
    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.V_R1_OK(message.webhookId)}`);

    if (!config.allowedWebhookIds.includes(message.webhookId)) {
      if (dbg)
        logger.warn(
          `[${CTX}] ${SIGNAL_MESSAGES.V_R2_FAIL(message.webhookId, config.allowedWebhookIds.join(', '))}`,
        );
      return false;
    }
    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.V_R2_OK}`);

    const channels = Array.isArray(config.channelId) ? config.channelId : [config.channelId];
    if (!channels.includes(message.channelId)) {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.V_R3_FAIL(message.channelId, channels.join(', '))}`);
      return false;
    }
    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.V_R3_OK}`);

    return true;
  }

  private parseAndVerify(
    content: string,
    hmacSecret: string,
    knownEvents: ReadonlySet<string>,
    dbg: boolean,
  ): SignalEnvelope | null {
    const raw = this.parseJson(content, dbg);
    if (!raw) return null;

    if (!this.validateEnvelopeFields(raw, knownEvents, dbg)) return null;
    if (!this.validateTimestamp(raw.sentAt, dbg)) return null;
    if (!this.validateSignature(raw, hmacSecret, dbg)) return null;

    return {
      v: 1,
      event: raw.event as string,
      guildId: raw.guildId as string,
      nonce: raw.nonce as string,
      sentAt: raw.sentAt as number,
      signature: raw.signature as string,
      payload: raw.payload ?? {},
    };
  }

  private parseJson(content: string, dbg: boolean): Record<string, unknown> | null {
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.V_R4_FAIL_JSON(content.slice(0, 200))}`);
      return null;
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.V_R4_FAIL_OBJ}`);
      return null;
    }

    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.V_R4_OK}`);
    return parsed as Record<string, unknown>;
  }

  private validateEnvelopeFields(
    raw: Record<string, unknown>,
    knownEvents: ReadonlySet<string>,
    dbg: boolean,
  ): boolean {
    if (raw.v !== 1) {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.V_R5_FAIL(raw.v)}`);
      return false;
    }
    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.V_R5_OK}`);

    if (typeof raw.event !== 'string' || !knownEvents.has(raw.event)) {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.V_R6_FAIL(raw.event, [...knownEvents].join(', '))}`);
      return false;
    }
    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.V_R6_OK(raw.event as string)}`);

    if (typeof raw.guildId !== 'string' || raw.guildId.length === 0) {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.V_R7_FAIL(raw.guildId)}`);
      return false;
    }
    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.V_R7_OK(raw.guildId as string)}`);

    if (typeof raw.nonce !== 'string' || raw.nonce.length === 0) {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.V_R8_FAIL(raw.nonce)}`);
      return false;
    }
    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.V_R8_OK(raw.nonce as string)}`);

    return true;
  }

  private validateTimestamp(sentAt: unknown, dbg: boolean): boolean {
    if (typeof sentAt !== 'number') {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.V_R9_FAIL_TYPE(sentAt)}`);
      return false;
    }

    const skew = Math.abs(Date.now() - sentAt);
    if (skew > MAX_CLOCK_SKEW_MS) {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.V_R9_FAIL_SKEW(skew, MAX_CLOCK_SKEW_MS)}`);
      return false;
    }

    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.V_R9_OK(skew)}`);
    return true;
  }

  private validateSignature(raw: Record<string, unknown>, secret: string, dbg: boolean): boolean {
    if (typeof raw.signature !== 'string' || raw.signature.length === 0) {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.V_R10_FAIL_MISSING}`);
      return false;
    }

    const valid = HmacService.verify(
      raw.nonce as string,
      raw.sentAt as number,
      raw.payload ?? {},
      raw.signature as string,
      secret,
    );

    if (!valid) {
      if (dbg) logger.warn(`[${CTX}] ${SIGNAL_MESSAGES.V_R10_FAIL_HMAC}`);
      return false;
    }

    if (dbg) logger.info(`[${CTX}] ${SIGNAL_MESSAGES.V_R10_OK}`);
    return true;
  }
}
