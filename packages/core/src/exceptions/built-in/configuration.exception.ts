import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when a configuration error is detected at runtime.
 *
 * Does NOT reply to the user , configuration issues are operational concerns
 * that belong in logs, not in Discord messages.
 *
 * Available props in layout templates:
 * - `{{key}}` , the config key that is invalid or missing
 * - `{{reason}}` , description of the problem
 *
 * @example
 * throw new ConfigurationException({ key: 'clientId', reason: 'must be a valid Discord snowflake' });
 */
export class ConfigurationException extends SpraxiumException {
  constructor(props?: { key?: string; reason?: string } & Record<string, unknown>) {
    super({
      code: 'CONFIGURATION_ERROR',
      message: 'Configuration error: {{key}} , {{reason}}',
      props: props ?? {},
      shouldReply: false,
      shouldLog: true,
    });
  }
}
