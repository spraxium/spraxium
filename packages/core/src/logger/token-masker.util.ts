import { DISCORD_TOKEN_PATTERN } from './constants';

export class TokenMasker {
  private enabled = true;

  configure(enabled: boolean): void {
    this.enabled = enabled;
  }

  mask(input: string): string {
    if (!this.enabled) return input;
    return input.replace(DISCORD_TOKEN_PATTERN, '[REDACTED]');
  }
}
