import type { InlineParams } from '../../../runtime/dispatcher/helpers/split-custom-id.helper';
import type { AnyConstructor } from '../../../types';
import type { SelectOptionConfig } from './select-option.interface';

export type DynamicSelectEncoding = 'store' | 'inline';

/**
 * Configuration for `@DynamicStringSelect({ baseId })`.
 * The base ID is the prefix used to match incoming select interactions;
 * each rendered instance appends `~p:<id>` (store, default) or inline params
 * (inline) — and optionally `~ctx:<id>`.
 */
export interface DynamicStringSelectConfig {
  baseId: string;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  /** Default TTL (seconds) applied to payloads created for this select. Defaults to 600 (10m). Only used for `encoding: 'store'`. */
  payloadTtl?: number;
  /**
   * Controls how render data is represented in custom IDs.
   * - `'store'` (default): persists the full render argument as a payload and appends `~p:<id>`.
   * - `'inline'`: encodes `render().params` directly into the custom ID. No storage, no TTL.
   */
  encoding?: DynamicSelectEncoding;
}

/**
 * Returned by a dynamic select's `static render(items)` static method.
 * Defines the per-instance options and (optionally) overrides for the placeholder /
 * min-max values. The custom ID is appended automatically.
 *
 * When `encoding: 'inline'` is set on the component, the `params` field is
 * URL-encoded and embedded directly in the custom ID.
 */
export interface SelectRenderConfig {
  options: Array<SelectOptionConfig>;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  /**
   * Extra key/value params used by `encoding: 'inline'`. Values are URL-encoded
   * and embedded directly in the custom ID. Ignored for `encoding: 'store'`.
   */
  params?: InlineParams;
}

export interface DynamicSelectComponentMeta {
  baseId: string;
  payloadTtl?: number;
  encoding: DynamicSelectEncoding;
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
