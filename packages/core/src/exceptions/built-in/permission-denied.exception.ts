import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when the user lacks Discord permissions required for this command.
 *
 * Available props in layout templates:
 * - `{{permission}}` , the required Discord permission name (optional)
 *
 * @example
 * throw new PermissionDeniedException({ permission: 'BanMembers' });
 */
export class PermissionDeniedException extends SpraxiumException {
  constructor(props?: { permission?: string } & Record<string, unknown>) {
    super({
      code: 'PERMISSION_DENIED',
      message: 'You do not have the required permissions to use this command.',
      props: props ?? {},
    });
  }
}
