import { Ctx, PrefixArg, PrefixCommandHandler } from '@spraxium/common';

import { Logger, PrefixDispatcher } from '@spraxium/core';
import { EmbedBuilder } from 'discord.js';
import type { Message } from 'discord.js';
import { HelpCommand } from '../commands/help.command';

@PrefixCommandHandler(HelpCommand)
export class HelpHandler {
  private readonly logger = new Logger(HelpHandler.name);

  constructor(private readonly prefixDispatcher: PrefixDispatcher) {}

  async handle(
    @Ctx() message: Message,
    @PrefixArg('command') commandName: string | undefined,
  ): Promise<void> {
    const allCommands = this.prefixDispatcher.getCommandInfo();

    if (commandName) {
      const info = allCommands.find((c) => c.name === commandName || c.aliases.includes(commandName));

      if (!info) {
        await message.reply(`❓ Unknown command: \`${commandName}\`. Use \`!help\` to see all commands.`);
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`Command: !${info.name}`)
        .setDescription(info.description || 'No description.')
        .addFields(
          {
            name: 'Aliases',
            value: info.aliases.length ? info.aliases.map((a) => `\`${a}\``).join(', ') : '—',
            inline: true,
          },
          { name: 'Category', value: info.category || '—', inline: true },
          { name: 'Cooldown', value: info.cooldown ? `${info.cooldown}s` : '—', inline: true },
          { name: 'Usage', value: info.usage ? `\`${info.usage}\`` : '—' },
        );

      if (info.args.length > 0) {
        const argList = info.args
          .map((a) => `\`${a.name}\` — ${a.type}${a.required ? '' : ' (optional)'}`)
          .join('\n');
        embed.addFields({ name: 'Arguments', value: argList });
      }

      if (info.subcommands.length > 0) {
        const subList = info.subcommands.map((s) => `\`${s.name}\``).join(', ');
        embed.addFields({ name: 'Subcommands', value: subList });
      }

      await message.reply({ embeds: [embed] });
      return;
    }

    const byCategory = new Map<string, string[]>();
    for (const cmd of allCommands) {
      const cat = cmd.category || 'Uncategorized';
      const entry = byCategory.get(cat) ?? [];
      entry.push(`\`!${cmd.name}\` — ${cmd.description || 'No description.'}`);
      byCategory.set(cat, entry);
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📖 Available Commands')
      .setFooter({ text: 'Use !help <command> for details.' });

    for (const [category, cmds] of byCategory) {
      embed.addFields({ name: category, value: cmds.join('\n') });
    }

    this.logger.debug(`${message.author.tag} requested help`);
    await message.reply({ embeds: [embed] });
  }
}
