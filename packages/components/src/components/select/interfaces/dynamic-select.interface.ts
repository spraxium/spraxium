import type { AnyConstructor } from '../../../types';
import type { SelectOptionConfig } from './select-option.interface';

/**
 * Configuration for `@DynamicStringSelect({ baseId })`.
 * The base ID is the prefix used to match incoming select interactions —
 * each rendered instance appends `~p:<id>` (and optionally `~ctx:<id>`).
 */
export interface DynamicStringSelectConfig {
  baseId: string;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  /** Default TTL (seconds) applied to payloads created for this select. Defaults to 600 (10m). */
  payloadTtl?: number;
}

/**
 * Returned by a dynamic select's `static render(items)` static method.
 * Defines the per-instance options and (optionally) overrides for the placeholder /
 * min-max values. The custom ID is appended automatically.
 */
export interface SelectRenderConfig {
  options: Array<SelectOptionConfig>;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
}

export interface DynamicSelectComponentMeta {
  baseId: string;
  payloadTtl?: number;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
}

export interface DynamicSelectHandlerMeta {
  component: AnyConstructor;
}

/** Render contract enforced (at runtime) on classes decorated with `@DynamicStringSelect`. */
export interface DynamicSelectRenderable<T = unknown> {
  render(items: T): SelectRenderConfig;
}
