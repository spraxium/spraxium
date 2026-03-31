import type { GuildBan } from 'discord.js';
import type { SerializedBan } from '../../types';

export class BanSerializer {
  serialize(ban: GuildBan): SerializedBan {
    return {
      user: {
        id: ban.user.id,
        username: ban.user.username,
        discriminator: ban.user.discriminator,
        avatar: ban.user.avatar,
        bot: ban.user.bot,
        createdAt: ban.user.createdAt.toISOString(),
      },
      reason: ban.reason ?? null,
    };
  }

  serializeMany(bans: Array<GuildBan>): Array<SerializedBan> {
    return bans.map((b) => this.serialize(b));
  }
}
