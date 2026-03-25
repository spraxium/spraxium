import { Colors, EmbedBuilder, MessageFlags } from 'discord.js';
import type { ExceptionLayout, ExceptionLayoutPayload } from '../interfaces';
import { resolvePlaceholders } from '../placeholder.resolver';
import type { SpraxiumException } from '../spraxium.exception';

/**
 * Built-in fallback layout used when no custom layout is registered.
 *
 * Renders a minimal ephemeral red embed with the exception message
 * after resolving any {{placeholder}} tokens against the exception's props.
 *
 * Replace this globally by registering `default` in `exceptions.layouts`:
 * @example
 * exceptions: { layouts: { default: MyCompanyErrorLayout } }
 */
export class DefaultExceptionLayout implements ExceptionLayout {
  public build(exception: SpraxiumException): ExceptionLayoutPayload {
    const description = resolvePlaceholders(exception.message, exception.props);

    return {
      embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(description)],
      flags: MessageFlags.Ephemeral,
    };
  }
}
