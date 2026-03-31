import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when the bot or a specific feature is under maintenance.
 *
 * Available props in layout templates:
 * - `{{feature}}` , name of the feature under maintenance (optional)
 * - `{{eta}}` , estimated time for completion (optional)
 *
 * @example
 * throw new MaintenanceException({ feature: 'Economy', eta: '30 minutes' });
 */
export class MaintenanceException extends SpraxiumException {
  constructor(props?: { feature?: string; eta?: string } & Record<string, unknown>) {
    super({
      code: 'MAINTENANCE',
      message: 'This feature is currently under maintenance. Please try again later.',
      props: props ?? {},
    });
  }
}
