import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when a feature or command requires a premium subscription or role.
 *
 * Available props in layout templates:
 * - `{{tier}}` — the required plan/tier name (optional, e.g. 'Pro', 'Premium')
 *
 * @example
 * throw new PremiumOnlyException({ tier: 'Pro' });
 */
export class PremiumOnlyException extends SpraxiumException {
  constructor(props?: { tier?: string } & Record<string, unknown>) {
    super({
      code: 'PREMIUM_ONLY',
      message: 'This feature requires a premium subscription.',
      props: props ?? {},
    });
  }
}
