import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when user-supplied input fails validation.
 *
 * Available props in layout templates:
 * - `{{field}}` , the name of the invalid field
 * - `{{reason}}` , human-readable reason for the failure (optional)
 *
 * @example
 * throw new ValidationException({ field: 'username', reason: 'must be at least 3 characters' });
 */
export class ValidationException extends SpraxiumException {
  constructor(props?: { field?: string; reason?: string } & Record<string, unknown>) {
    super({
      code: 'VALIDATION',
      message: 'The field **{{field}}** contains an invalid value.',
      props: props ?? {},
    });
  }
}
