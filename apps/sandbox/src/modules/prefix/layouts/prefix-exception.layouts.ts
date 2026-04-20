import { defineExceptionLayout } from '@spraxium/core';
import { EmbedBuilder } from 'discord.js';

export const ArgumentExceptionLayout = defineExceptionLayout((ex) => ({
  embeds: [
    new EmbedBuilder()
      .setColor(0xff6b35)
      .setTitle('❌ Invalid Argument')
      .setDescription(
        [
          `**Argument:** \`${ex.props.argument}\``,
          `**Expected:** ${ex.props.expected}`,
          ex.props.received ? `**Received:** \`${ex.props.received}\`` : null,
          ex.props.usage ? `\n**Usage:** \`${ex.props.usage}\`` : null,
        ]
          .filter(Boolean)
          .join('\n'),
      )
      .setFooter({ text: 'Check the command usage and try again.' }),
  ],
  ephemeral: false,
}));

export const CommandNotFoundLayout = defineExceptionLayout((ex) => ({
  embeds: [
    new EmbedBuilder()
      .setColor(0x99aab5)
      .setTitle('❓ Unknown Command')
      .setDescription(
        `\`${ex.props.prefix}${ex.props.command}\` is not a recognised command.\n\nUse \`${ex.props.prefix}help\` to see available commands.`,
      ),
  ],
  ephemeral: false,
}));
