import { MESSAGES } from '../../constants/messages.constant';
import { MetadataHelper } from '../../utils/metadata.util';

/** Validates that the environment variable is a valid Discord bot token. */
export function IsDiscordToken(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsDiscordToken',
      type: 'discord-token',
      validate: (value) => {
        if (typeof value !== 'string') return MESSAGES.EXPECTED_STRING;
        const segments = value.split('.');
        if (segments.length !== 3) {
          return MESSAGES.EXPECTED_DISCORD_TOKEN_SEGMENTS(segments.length);
        }
        const base64urlRe = /^[A-Za-z0-9_-]+$/;
        if (!segments.every((s) => s.length > 0 && base64urlRe.test(s))) {
          return MESSAGES.DISCORD_TOKEN_INVALID_CHARS;
        }
        if (value.length < 59 || value.length > 100) {
          return MESSAGES.DISCORD_TOKEN_LENGTH(value.length);
        }
        return null;
      },
    });
  };
}

/** Validates that the environment variable is a valid Discord snowflake ID (17-19 digits). */
export function IsDiscordId(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsDiscordId',
      type: 'discord-id',
      validate: (value) => {
        if (typeof value !== 'string') return MESSAGES.EXPECTED_STRING;
        if (!/^\d{17,19}$/.test(value)) {
          return MESSAGES.EXPECTED_DISCORD_ID(value);
        }
        return null;
      },
    });
  };
}

/**
 * Validates that the environment variable is a valid Discord webhook URL.
 *
 * Accepted hosts: `discord.com`, `canary.discord.com`, `ptb.discord.com`.
 * The URL must follow the pattern `/api/webhooks/{id}/{token}`.
 *
 * **Mark this field as `secret`** — webhook URLs contain an embedded token.
 */
export function IsDiscordWebhookUrl(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsDiscordWebhookUrl',
      type: 'discord-webhook-url',
      validate: (value) => {
        if (typeof value !== 'string') return MESSAGES.EXPECTED_STRING;
        const webhookRe =
          /^https:\/\/(discord\.com|canary\.discord\.com|ptb\.discord\.com)\/api\/webhooks\/\d{17,19}\/[A-Za-z0-9_-]+$/;
        if (!webhookRe.test(value)) {
          return MESSAGES.EXPECTED_DISCORD_WEBHOOK_URL(value);
        }
        return null;
      },
    });
  };
}

/**
 * Validates that the environment variable is a valid Discord OAuth2 client secret.
 *
 * Accepts non-empty opaque strings of 24–64 URL-safe characters (no whitespace).
 *
 * **Always mark this field as `secret`.**
 */
export function IsDiscordClientSecret(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsDiscordClientSecret',
      type: 'discord-client-secret',
      validate: (value) => {
        if (typeof value !== 'string') return MESSAGES.EXPECTED_STRING;
        if (value.length < 24 || value.length > 64) {
          return MESSAGES.DISCORD_CLIENT_SECRET_LENGTH(value.length);
        }
        if (/\s/.test(value)) {
          return MESSAGES.DISCORD_CLIENT_SECRET_WHITESPACE;
        }
        return null;
      },
    });
  };
}

/**
 * Validates that the environment variable is a valid Discord permission bitfield.
 *
 * Discord permissions are represented as a non-negative decimal integer string
 * that can exceed 32 bits (BigInt range). Examples: `"8"`, `"2147483647"`, `"274877906944"`.
 */
export function IsDiscordPermissions(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsDiscordPermissions',
      type: 'discord-permissions',
      validate: (value) => {
        if (typeof value !== 'string') return MESSAGES.EXPECTED_STRING;
        if (!/^\d+$/.test(value)) {
          return MESSAGES.EXPECTED_DISCORD_PERMISSIONS(value);
        }
        return null;
      },
    });
  };
}
