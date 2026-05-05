import { DISCORD_TOKEN_PATTERN } from '../constants';

/**
 * Scans log message strings for patterns that match a Discord bot token and
 * replaces them with `[REDACTED]`.
 *
 * Security: masking is applied before any transport receives the entry, so
 * tokens never reach remote transports (webhooks, channels, etc.).
 */
export class TokenMasker {
  private enabled = true;

  configure(enabled: boolean): void {
    this.enabled = enabled;
  }

  mask(input: string): string {
    if (!this.enabled) return input;
    // Reset lastIndex before every call — the pattern uses the `g` flag and
    // a shared RegExp instance retains state between calls.
    DISCORD_TOKEN_PATTERN.lastIndex = 0;
    return input.replace(DISCORD_TOKEN_PATTERN, '[REDACTED]');
  }
}
