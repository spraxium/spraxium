import { Listener, On } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { Events, type GuildMember, type PartialGuildMember } from 'discord.js';

@Listener(Events.GuildMemberAdd)
export class MemberJoinListener {
  private readonly logger = new Logger(MemberJoinListener.name);

  @On()
  async onJoin(member: GuildMember): Promise<void> {
    const guildChannel = await member.guild.channels.fetch('1487261100474110075');
    if(!guildChannel?.isTextBased()) return;
    await guildChannel.send(`Bem-vindo, ${member}!`);
    this.logger.info(`${member.user.username} entrou no servidor ${member.guild.id}`);
  }
}

@Listener(Events.GuildMemberRemove)
export class MemberLeaveListener {
  private readonly logger = new Logger(MemberLeaveListener.name);

  @On()
  async onLeave(member: GuildMember | PartialGuildMember): Promise<void> {
    const name = member.partial ? `<usuário ${member.id}>` : member.user.username;
    this.logger.info(`${name} saiu do servidor ${member.guild.id}`);
  }
}
