export interface WebhookConfig {
  /**
   * Named webhook registry. Each key is an alias used throughout the application
   * (e.g. `'alerts'`, `'logs'`), and the value is the full Discord webhook URL.
   *
   * @example
   * webhooks: {
   *   alerts: process.env.WEBHOOK_ALERTS ?? '',
   *   logs: process.env.WEBHOOK_LOGS ?? '',
   * }
   */
  webhooks: Record<string, string>;

  /**
   * Default username override applied to every send call unless overridden per-call.
   */
  globalUsername?: string;

  /**
   * Default avatar URL applied to every send call unless overridden per-call.
   */
  globalAvatarUrl?: string;

  /**
   * Optional global error handler invoked whenever a send operation fails.
   * If not provided, errors are logged via the internal logger and re-thrown.
   */
  onError?: (name: string, error: Error) => void;
}
