import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { V2Service, desc } from '@spraxium/components';
import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';
import { V2DemoCommand } from '../commands/v2-demo.command';

@SlashCommandHandler(V2DemoCommand, { sub: 'fluent' })
export class V2FluentHandler {
  constructor(private readonly v2: V2Service) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.user;

    const payload = this.v2
      .container({ accentColor: 0x5865f2 })
      .text(desc().h2(`👋 Hello, ${user.tag}`))
      .sep()
      .section(
        [
          `**User ID:** \`${user.id}\``,
          `**Account created:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
        ].join('\n'),
        this.v2.thumbnail(user.displayAvatarURL({ size: 128 }), {
          description: `${user.tag} avatar`,
        }),
      )
      .sep({ divider: false })
      .text(desc().subtext('Built with Spraxium V2 fluent API'))
      .toReply();

    await interaction.reply({
      ...payload,
      flags: payload.flags | MessageFlags.Ephemeral,
    });
  }
}
