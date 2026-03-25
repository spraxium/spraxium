import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when a user triggers a command cooldown.
 *
 * Available props in layout templates:
 * - `{{seconds}}` — remaining wait time in seconds
 *
 * @example
 * throw new CooldownException({ seconds: 10 });
 */
export class CooldownException extends SpraxiumException {
  constructor(props?: { seconds?: number } & Record<string, unknown>) {
    super({
      code: 'COOLDOWN',
      message: 'You need to wait **{{seconds}}** seconds before using this command again.',
      props: props ?? {},
    });
  }
}
