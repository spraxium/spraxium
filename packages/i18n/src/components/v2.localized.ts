import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '@spraxium/components';
import type { V2ChildDef, V2ReplyPayload, V2SectionConfig, V2TextDisplayConfig } from '@spraxium/components';
import { MessageFlags } from 'discord.js';
import type { ContainerBuilder } from 'discord.js';
import { resolveKey } from './utils';

// biome-ignore lint/suspicious/noExplicitAny: generic class constructor
type AnyConstructor = new (...args: Array<any>) => object;

export interface BuildLocalizedV2Options {
  /** Class decorated with `@V2Container`. */
  containerClass: AnyConstructor;
  /** Discord locale string, e.g. `'pt-BR'`. */
  locale: string;
  /**
   * `V2Service` instance from the DI container.
   * Accepts any object with a compatible `build` method to avoid a hard dep cycle.
   */
  v2Service: { build: (cls: AnyConstructor, data?: unknown) => ContainerBuilder };
  /** Optional runtime data forwarded to dynamic child factories. */
  data?: unknown;
}

/**
 * Builds a localized V2 container by resolving `i18n` keys on `textDisplay` and `section`
 * children before delegating to the provided `V2Service.build` implementation.
 *
 * Only static string `content`/`text` values are eligible for i18n override;
 * dynamic function-based values are passed through unchanged.
 *
 * @example
 * const reply = buildLocalizedV2({ containerClass: WelcomeContainer, locale, v2Service: this.v2 });
 * await interaction.reply(reply);
 */
export function buildLocalizedV2({
  containerClass: ContainerClass,
  locale,
  v2Service,
  data,
}: BuildLocalizedV2Options): V2ReplyPayload {
  const children: Array<V2ChildDef> =
    Reflect.getMetadata(COMPONENT_METADATA_KEYS.V2_CHILDREN, ContainerClass) ?? [];

  const restorers: Array<() => void> = [];

  for (const child of children) {
    if (child.type === 'textDisplay') {
      const cfg = child.config as V2TextDisplayConfig;
      if (cfg.i18n?.content && typeof cfg.content === 'string') {
        const override = resolveKey(cfg.i18n.content, locale);
        if (override !== undefined) {
          const original = cfg.content;
          cfg.content = override;
          restorers.push(() => {
            cfg.content = original;
          });
        }
      }
    } else if (child.type === 'section') {
      const cfg = child.config as V2SectionConfig;
      if (cfg.i18n?.text && typeof cfg.text === 'string') {
        const override = resolveKey(cfg.i18n.text, locale);
        if (override !== undefined) {
          const original = cfg.text;
          cfg.text = override;
          restorers.push(() => {
            cfg.text = original;
          });
        }
      }
    }
  }

  try {
    const container = v2Service.build(ContainerClass, data);
    const reply: V2ReplyPayload = {
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    };
    return reply;
  } finally {
    for (const restore of restorers) restore();
  }
}
