import type { AnyConstructor } from '../../../types';
import type { ButtonStyleName } from '../types';
import type { ButtonEmojiConfig } from './button-emoji.interface';

/**
 * Configuration for `@DynamicButton({ baseId })`.
 * The base ID is the prefix used to match incoming button interactions —
 * each rendered instance appends `~p:<id>` (and optionally `~ctx:<id>`).
 */
export interface DynamicButtonConfig {
  /** The dispatcher matches incoming custom IDs against this base ID. */
  baseId: string;
  /** Default TTL (seconds) applied to payloads created for this button. Defaults to 600 (10m). */
  payloadTtl?: number;
}

/**
 * Returned by a dynamic button's `static render(item)` method. Defines the
 * per-instance appearance only — the custom ID is appended automatically.
 */
export interface ButtonRenderConfig {
  label: string;
  style?: ButtonStyleName;
  emoji?: ButtonEmojiConfig;
  disabled?: boolean;
}

export interface DynamicButtonComponentMeta {
  baseId: string;
  payloadTtl?: number;
}

export interface DynamicButtonHandlerMeta {
  component: AnyConstructor;
}

/** Render contract enforced (at runtime) on classes decorated with `@DynamicButton`. */
export interface DynamicButtonRenderable<T = unknown> {
  render(item: T): ButtonRenderConfig;
}
