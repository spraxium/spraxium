export interface GuardOptionConfig {
  /** Fallback value when the caller doesn't pass this option. */
  default?: unknown;

  /** Makes this option mandatory — throws if not provided and no default is set. */
  required?: boolean;
}