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