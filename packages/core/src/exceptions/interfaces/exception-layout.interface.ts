import type { ExecutionContext } from '@spraxium/common';
import type { ActionRowBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { SpraxiumException } from '../spraxium.exception';
import type { ExceptionLayoutClass } from '../types';

/** Subset of MessageFlags valid in InteractionReplyOptions / followUp. */
type InteractionFlag =
  | MessageFlags.Ephemeral
  | MessageFlags.SuppressEmbeds
  | MessageFlags.SuppressNotifications
  | MessageFlags.IsComponentsV2;

/**
 * The Discord-compatible reply payload produced by an exception layout.
 *
 * All fields are optional , a layout may return just `content`, just `embeds`,
 * or any combination. When `ephemeral` is omitted it defaults to `true`.
 */
export interface ExceptionLayoutPayload {
  content?: string;
  embeds?: Array<EmbedBuilder>;
  // biome-ignore lint/suspicious/noExplicitAny: discord.js component generics are complex
  components?: Array<ActionRowBuilder<any>>;
  /** Whether the reply is visible only to the triggering user. Defaults to true. */
  ephemeral?: boolean;
  flags?: InteractionFlag;
}

/**
 * Contract for exception layout classes.
 *
 * A layout translates a thrown exception + its execution context into a
 * Discord reply payload. Keep layout classes focused on presentation only.
 *
 * @example
 * class CooldownLayout implements ExceptionLayout {
 *   build(ex: SpraxiumException): ExceptionLayoutPayload {
 *     return {
 *       embeds: [new EmbedBuilder().setDescription(`Wait **${ex.props.seconds}s**`)],
 *       ephemeral: true,
 *     };
 *   }
 * }
 *
 * // Or use the factory (no class needed):
 * const CooldownLayout = defineExceptionLayout((ex) => ({
 *   embeds: [new EmbedBuilder().setDescription(`Wait **${ex.props.seconds}s**`)],
 *   ephemeral: true,
 * }));
 */
export interface ExceptionLayout {
  build(
    exception: SpraxiumException,
    ctx: ExecutionContext,
  ): ExceptionLayoutPayload | Promise<ExceptionLayoutPayload>;
}

/**
 * Maps exception class names (or 'default') to layout constructor classes.
 *
 * Resolution order:
 *   1. `exception.layout` , per-instance override in the throw/constructor
 *   2. `layouts[ExceptionClassName]` , layout mapped to this exception type
 *   3. `@WithLayout(LayoutClass)` , decorator on the exception class itself
 *   4. `layouts.default` , global user-configured fallback
 *   5. `DefaultExceptionLayout` , framework built-in fallback (always present)
 *
 * @example
 * exceptions: {
 *   layouts: {
 *     default: MyErrorLayout,
 *     CooldownException: CooldownEmbedLayout,
 *     PremiumOnlyException: PremiumAccessLayout,
 *   }
 * }
 */
export type ExceptionLayoutMap = {
  default?: ExceptionLayoutClass;
  [exceptionName: string]: ExceptionLayoutClass | undefined;
};

/**
 * Exception configuration block accepted by SpraxiumOptions.
 */
export interface ExceptionOptions {
  /**
   * Map of exception class names → layout classes.
   * Fallback resolution: per-instance > this map > @WithLayout > built-in default.
   */
  layouts?: ExceptionLayoutMap;

  /**
   * Log unknown (non-SpraxiumException) errors to the framework logger.
   * @default true
   */
  logUnhandled?: boolean;
}

export interface SpraxiumExceptionOptions {
  /**
   * Stable machine-readable identifier for this exception type.
   * Used in logs and consumed by layout's {{code}} placeholder.
   * @example 'COOLDOWN', 'GUARD_DENIED', 'PERMISSION_DENIED'
   */
  code: string;

  /**
   * Human-readable description. Supports {{placeholder}} interpolation.
   * NOT automatically shown to users , the layout decides what to display.
   * @example 'Wait {{seconds}}s before using this command again.'
   */
  message?: string;

  /**
   * Runtime props injected at the throw site.
   * Available to the placeholder engine and to layouts.
   * @example { seconds: 10 }
   */
  props?: Record<string, unknown>;

  /**
   * Whether the exception handler should send a Discord reply.
   * @default true
   */
  shouldReply?: boolean;

  /**
   * Whether the exception handler should write to the logger.
   * @default false
   */
  shouldLog?: boolean;

  /**
   * Per-instance layout override. Takes priority over everything else
   * including @WithLayout and the global exception config map.
   */
  layout?: ExceptionLayoutClass;
}
