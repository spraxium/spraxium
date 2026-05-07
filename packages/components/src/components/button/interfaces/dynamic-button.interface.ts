import type { AnyConstructor } from '../../../types';
import type { ButtonStyleName } from '../types';
import type { ButtonEmojiConfig } from './button-emoji.interface';

export type DynamicButtonEncoding = 'store' | 'inline';

export type DynamicButtonParams = Record<string, string | number | boolean>;

/**
 * Configuration for `@DynamicButton({ baseId })`.
 * The base ID is the prefix used to match incoming button interactions;
 * each rendered instance appends either a payload ref (`~p:<id>`) or inline
 * params (`~k=v&...`), and may additionally append `~ctx:<id>`.
 */
export interface DynamicButtonConfig {
  /** The dispatcher matches incoming custom IDs against this base ID. */
  baseId: string;
  /** Default TTL (seconds) applied to payloads created for this button. Defaults to 600 (10m). */
  payloadTtl?: number;
  /**
   * Controls how render payloads are represented in custom IDs.
   * - 'store' (default): stores payload in ContextStore-backed payload storage and appends `~p:<id>`.
   * - 'inline': encodes `render().params` into the custom ID itself.
   */
  encoding?: DynamicButtonEncoding;
}

/**
 * Returned by a dynamic button's `static render(item)` method. Defines the
 * per-instance appearance only; the custom ID is appended automatically.
 */
export interface ButtonRenderConfig {
  label: string;
  style?: ButtonStyleName;
  emoji?: ButtonEmojiConfig;
  disabled?: boolean;
  /**
   * Extra key/value params used by `encoding: 'inline'`. Values are URL-encoded
   * and embedded directly in the custom ID.
   */
  params?: DynamicButtonParams;
}

export interface DynamicButtonComponentMeta {
  baseId: string;
  payloadTtl?: number;
  encoding: DynamicButtonEncoding;
}

export interface DynamicButtonHandlerMeta {
  component: AnyConstructor;
}

/** Render contract enforced (at runtime) on classes decorated with `@DynamicButton`. */
export interface DynamicButtonRenderable<T = unknown> {
  render(item: T): ButtonRenderConfig;
}

export type ParamsOf<T extends { render(item: unknown): ButtonRenderConfig }> = NonNullable<
  ReturnType<T['render']>['params']
>;
