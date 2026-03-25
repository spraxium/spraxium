import type { PrefixConfig } from '@spraxium/common';
import type { Client, Message } from 'discord.js';
import type { PrefixGuildManager } from './guild';
import type { ParsedPrefixMessage } from './interfaces';

export class PrefixParser {
  private clientId: string | undefined;

  public setClientId(client: Client): void {
    if (client.isReady()) {
      this.clientId = client.user.id;
    } else {
      client.once('ready', (c) => {
        this.clientId = c.user.id;
      });
    }
  }

  public parse(
    message: Message,
    config: PrefixConfig,
    guildManager: PrefixGuildManager,
  ): ParsedPrefixMessage | undefined {
    const content = message.content;
    if (!content) return undefined;

    const prefix = PrefixParser.detectPrefix(message, config, guildManager, this.clientId);
    if (prefix === undefined) return undefined;

    const afterPrefix = content.slice(prefix.length).trimStart();
    if (!afterPrefix) return undefined;

    const tokens = PrefixParser.tokenize(afterPrefix);
    if (tokens.length === 0) return undefined;

    const commandName = config.caseSensitive ? tokens[0] : tokens[0].toLowerCase();

    return {
      prefix,
      commandName,
      argv: tokens.slice(1),
    };
  }

  private static detectPrefix(
    message: Message,
    config: PrefixConfig,
    guildManager: PrefixGuildManager,
    clientId: string | undefined,
  ): string | undefined {
    const content = message.content;

    if (message.guildId) {
      const guildPrefixes = guildManager.getGuildPrefix(message.guildId);
      if (guildPrefixes !== undefined) {
        const match = PrefixParser.matchPrefix(content, guildPrefixes, config.caseSensitive ?? false);
        if (match) return match;
      }
    }

    const globalMatch = PrefixParser.matchPrefix(content, config.prefix, config.caseSensitive ?? false);
    if (globalMatch) return globalMatch;

    if (config.mentionPrefix !== false && clientId) {
      const mentionPatterns = [`<@${clientId}>`, `<@!${clientId}>`];
      for (const mention of mentionPatterns) {
        if (content.startsWith(mention)) return mention;
      }
    }

    return undefined;
  }

  private static matchPrefix(
    content: string,
    prefix: string | Array<string>,
    caseSensitive: boolean,
  ): string | undefined {
    const prefixes = Array.isArray(prefix) ? prefix : [prefix];
    const compare = caseSensitive ? content : content.toLowerCase();

    for (const p of prefixes) {
      const target = caseSensitive ? p : p.toLowerCase();
      if (compare.startsWith(target)) return content.slice(0, p.length);
    }

    return undefined;
  }

  public static tokenize(input: string): Array<string> {
    const tokens: Array<string> = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === ' ' && !inQuotes) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      current += char;
    }

    if (current) tokens.push(current);
    return tokens;
  }
}
