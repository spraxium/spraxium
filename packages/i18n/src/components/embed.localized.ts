import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS, EmbedFactory } from '@spraxium/components';
import type { EmbedFieldDef, EmbedI18nKeys, EmbedSchema } from '@spraxium/components';
import type { EmbedBuilder } from 'discord.js';
import { resolveKey } from './utils';

// biome-ignore lint/suspicious/noExplicitAny: generic class constructor
type AnyConstructor = new (...args: Array<any>) => object;

export interface BuildLocalizedEmbedOptions {
  /** Class decorated with `@Embed`. */
  embedClass: AnyConstructor;
  /** Discord locale string, e.g. `'pt-BR'`. */
  locale: string;
  /** Runtime data forwarded to field value factories. */
  data?: unknown;
}

/**
 * Builds a Discord embed with i18n keys resolved for the given locale.
 * Resolves schema-level overrides (title, description, author name, footer text)
 * and field-level name/value overrides for static string fields.
 *
 * @example
 * const embed = buildLocalizedEmbed({ embedClass: StatsEmbed, locale, data: statsData });
 * await interaction.reply({ embeds: [embed] });
 */
export function buildLocalizedEmbed({
  embedClass: EmbedClass,
  locale,
  data,
}: BuildLocalizedEmbedOptions): EmbedBuilder {
  const embed = EmbedFactory.build(EmbedClass, data);

  const schema: EmbedSchema | undefined = Reflect.getOwnMetadata(
    COMPONENT_METADATA_KEYS.EMBED_COMPONENT,
    EmbedClass,
  );

  if (schema?.i18n) {
    applySchemaI18n(embed, schema.i18n, locale);
  }

  applyFieldI18n(embed, EmbedClass, locale, data);

  return embed;
}

function applySchemaI18n(embed: EmbedBuilder, i18n: EmbedI18nKeys, locale: string): void {
  const titleOverride = resolveKey(i18n.title, locale);
  if (titleOverride !== undefined) embed.setTitle(titleOverride);

  const descOverride = resolveKey(i18n.description, locale);
  if (descOverride !== undefined) embed.setDescription(descOverride);

  const authorNameOverride = resolveKey(i18n.authorName, locale);
  if (authorNameOverride !== undefined && embed.data.author) {
    embed.setAuthor({ ...embed.data.author, name: authorNameOverride });
  }

  const footerTextOverride = resolveKey(i18n.footerText, locale);
  if (footerTextOverride !== undefined && embed.data.footer) {
    embed.setFooter({ ...embed.data.footer, text: footerTextOverride });
  }
}

function applyFieldI18n(
  embed: EmbedBuilder,
  EmbedClass: AnyConstructor,
  locale: string,
  data: unknown,
): void {
  const fieldDefs: Array<EmbedFieldDef> =
    Reflect.getMetadata(COMPONENT_METADATA_KEYS.EMBED_FIELDS_LIST, EmbedClass) ?? [];
  const sorted = [...fieldDefs].sort((a, b) => a.order - b.order);

  let builtIndex = 0;
  for (const field of sorted) {
    const when = Reflect.getMetadata(
      `${COMPONENT_METADATA_KEYS.EMBED_WHEN}:${field.propertyKey}`,
      EmbedClass,
    ) as ((d: unknown) => boolean) | undefined;
    if (when && !when(data)) continue;

    if (field.i18n) {
      const nameOverride = resolveKey(field.i18n.name, locale);
      const valueOverride = resolveKey(field.i18n.value, locale);
      const current = embed.data.fields?.[builtIndex];

      if (current && (nameOverride !== undefined || valueOverride !== undefined)) {
        embed.spliceFields(builtIndex, 1, {
          name: nameOverride ?? current.name,
          value: valueOverride ?? current.value,
          inline: current.inline ?? false,
        });
      }
    }

    builtIndex++;
  }
}
