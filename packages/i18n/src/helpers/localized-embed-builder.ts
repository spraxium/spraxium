import { type APIEmbed, type ColorResolvable, EmbedBuilder } from 'discord.js';
import type { LocalizedField } from '../interfaces/localized-field.interface';
import type { I18nService } from '../service/i18n.service';
import type { InterpolationVars } from '../types/interpolation-vars.type';

/**
 * Helper that builds a Discord embed with translated title, description, and fields.
 *
 * @example
 * ```ts
 * const embed = new LocalizedEmbedBuilder(i18n, 'pt-BR')
 *   .setTitle('embeds.welcome.title', { user: 'Henry' })
 *   .setDescription('embeds.welcome.description')
 *   .addLocalizedField({
 *     nameKey: 'embeds.welcome.level_name',
 *     valueKey: 'embeds.welcome.level_value',
 *     valueVars: { level: 5 },
 *   })
 *   .setColor('#5865F2')
 *   .build();
 * ```
 */
export class LocalizedEmbedBuilder {
  private readonly builder = new EmbedBuilder();
  private readonly i18n: I18nService;
  private readonly locale: string;

  constructor(i18n: I18nService, locale: string) {
    this.i18n = i18n;
    this.locale = locale;
  }

  setTitle(key: string, vars?: InterpolationVars): this {
    this.builder.setTitle(this.i18n.t(key, this.locale, vars));
    return this;
  }

  setDescription(key: string, vars?: InterpolationVars): this {
    this.builder.setDescription(this.i18n.t(key, this.locale, vars));
    return this;
  }

  setFooter(key: string, vars?: InterpolationVars, iconURL?: string): this {
    this.builder.setFooter({ text: this.i18n.t(key, this.locale, vars), iconURL });
    return this;
  }

  setAuthor(key: string, vars?: InterpolationVars, iconURL?: string, url?: string): this {
    this.builder.setAuthor({ name: this.i18n.t(key, this.locale, vars), iconURL, url });
    return this;
  }

  addLocalizedField(field: LocalizedField): this {
    this.builder.addFields({
      name: this.i18n.t(field.nameKey, this.locale, field.nameVars),
      value: this.i18n.t(field.valueKey, this.locale, field.valueVars),
      inline: field.inline,
    });
    return this;
  }

  addLocalizedFields(fields: Array<LocalizedField>): this {
    for (const field of fields) {
      this.addLocalizedField(field);
    }
    return this;
  }

  setColor(color: ColorResolvable): this {
    this.builder.setColor(color);
    return this;
  }

  setThumbnail(url: string): this {
    this.builder.setThumbnail(url);
    return this;
  }

  setImage(url: string): this {
    this.builder.setImage(url);
    return this;
  }

  setTimestamp(timestamp?: Date | number | null): this {
    this.builder.setTimestamp(timestamp);
    return this;
  }

  setURL(url: string): this {
    this.builder.setURL(url);
    return this;
  }

  build(): EmbedBuilder {
    return this.builder;
  }

  toJSON(): APIEmbed {
    return this.builder.toJSON();
  }
}
