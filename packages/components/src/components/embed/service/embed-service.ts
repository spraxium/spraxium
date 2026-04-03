import { Injectable } from '@spraxium/common';
import { EmbedBuilder } from 'discord.js';
import type { AnyConstructor } from '../../../types';
import { ColorResolver } from '../utils';
import { EmbedFactory } from './embed-factory';

/**
 * Builds Discord embeds from `@Embed` schema classes.
 *
 * @example
 * ```ts
 * constructor(@Inject(EmbedService) private readonly embeds: EmbedService) {}
 *
 * const embed = this.embeds.build(ServerStatsEmbed, data);
 * ```
 */
@Injectable()
export class EmbedService {
  /** Builds an `EmbedBuilder` from an `@Embed` schema class and runtime data. */
  build<T = unknown>(EmbedClass: AnyConstructor, data?: T): EmbedBuilder {
    return EmbedFactory.build(EmbedClass, data);
  }

  /** Builds a quick embed without a schema class. */
  simple(title: string, description: string, color: number | string = 0x5865f2): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(ColorResolver.resolve(color));
  }

  /** Builds a compact error embed with red accent. */
  error(title: string, description: string): EmbedBuilder {
    return this.simple(`❌ ${title}`, description, 0xed4245);
  }
}
