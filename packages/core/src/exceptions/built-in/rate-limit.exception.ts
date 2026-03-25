import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when the bot is being rate limited and cannot fulfill a request.
 *
 * Available props in layout templates:
 * - `{{retryAfter}}` — milliseconds until the rate limit resets (optional)
 * - `{{route}}` — the API route that was rate limited (optional)
 *
 * @example
 * throw new RateLimitException({ retryAfter: 5000 });
 */
export class RateLimitException extends SpraxiumException {
  constructor(props?: { retryAfter?: number; route?: string } & Record<string, unknown>) {
    super({
      code: 'RATE_LIMITED',
      message: 'The bot is currently rate limited. Please try again in a moment.',
      props: props ?? {},
      shouldLog: true,
    });
  }
}
