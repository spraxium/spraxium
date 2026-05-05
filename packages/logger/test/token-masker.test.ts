import { beforeEach, describe, expect, it } from 'vitest';
import { TokenMasker } from '../src/utils/token-masker.util';

/**
 * A fake token that satisfies the three-segment pattern used by Discord:
 *   [\w-]{24,} . [\w-]{6,} . [\w-]{27,}
 */
const FAKE_TOKEN = 'MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMi.GaBcDe.ABCDEFGHIJKLMNOPQRSTUVWXYZabcde';

describe('TokenMasker', () => {
  let masker: TokenMasker;

  beforeEach(() => {
    masker = new TokenMasker();
  });

  describe('mask() — when enabled (default)', () => {
    it('returns the string unchanged when it contains no token', () => {
      expect(masker.mask('hello world')).toBe('hello world');
    });

    it('replaces a bare Discord token with [REDACTED]', () => {
      expect(masker.mask(FAKE_TOKEN)).toBe('[REDACTED]');
    });

    it('replaces a token embedded in surrounding text', () => {
      expect(masker.mask(`token: ${FAKE_TOKEN} end`)).toBe('token: [REDACTED] end');
    });

    it('replaces multiple tokens in a single string', () => {
      const input = `t1=${FAKE_TOKEN} t2=${FAKE_TOKEN}`;
      expect(masker.mask(input)).toBe('t1=[REDACTED] t2=[REDACTED]');
    });

    it('does not modify strings whose segments are too short to match', () => {
      // Segment 1 is only 5 chars — far below the 24-char minimum.
      expect(masker.mask('short.abc123.xxxxxxxxx')).toBe('short.abc123.xxxxxxxxx');
    });

    it('works correctly on repeated consecutive calls (lastIndex reset)', () => {
      // If DISCORD_TOKEN_PATTERN.lastIndex were not reset, the global RegExp
      // would retain state and skip the match on the second or third call.
      expect(masker.mask(FAKE_TOKEN)).toBe('[REDACTED]');
      expect(masker.mask(FAKE_TOKEN)).toBe('[REDACTED]');
      expect(masker.mask(FAKE_TOKEN)).toBe('[REDACTED]');
    });
  });

  describe('mask() — when disabled', () => {
    it('returns the input as-is', () => {
      masker.configure(false);
      expect(masker.mask(`token: ${FAKE_TOKEN}`)).toBe(`token: ${FAKE_TOKEN}`);
    });

    it('returns a plain string unchanged', () => {
      masker.configure(false);
      expect(masker.mask('hello world')).toBe('hello world');
    });
  });

  describe('configure()', () => {
    it('re-enables masking after configure(true)', () => {
      masker.configure(false);
      masker.configure(true);
      expect(masker.mask(`token: ${FAKE_TOKEN}`)).toBe('token: [REDACTED]');
    });

    it('disabling then re-enabling works multiple times', () => {
      masker.configure(false);
      masker.configure(true);
      masker.configure(false);
      masker.configure(true);
      expect(masker.mask(FAKE_TOKEN)).toBe('[REDACTED]');
    });
  });
});
