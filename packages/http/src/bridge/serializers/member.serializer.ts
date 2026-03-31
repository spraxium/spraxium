import type { GuildMember } from 'discord.js';
import type { SerializedMember } from '../../types';

export class MemberSerializer {
  serialize(member: GuildMember): SerializedMember {
    return {
      id: member.id,
      username: member.user.username,
      displayName: member.displayName,
      discriminator: member.user.discriminator,
      avatar: member.avatar ?? member.user.avatar,
      bot: member.user.bot,
      joinedAt: member.joinedAt?.toISOString() ?? null,
      createdAt: member.user.createdAt.toISOString(),
      roles: [...member.roles.cache.values()].map((r) => ({
        id: r.id,
        name: r.name,
        color: r.hexColor,
        position: r.position,
        permissions: r.permissions.bitfield.toString(),
        managed: r.managed,
        mentionable: r.mentionable,
      })),
      pending: member.pending,
      communicationDisabledUntil:
        member.communicationDisabledUntilTimestamp != null
          ? new Date(member.communicationDisabledUntilTimestamp).toISOString()
          : null,
    };
  }

  serializeMany(members: Array<GuildMember>): Array<SerializedMember> {
    return members.map((m) => this.serialize(m));
  }
}
