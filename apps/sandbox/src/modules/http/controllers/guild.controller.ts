import {
  BadRequestError,
  BotBridge,
  HttpController,
  HttpDelete,
  HttpGet,
  NotFoundError,
  HttpParam,
  HttpPost,
  HttpBody,
} from '@spraxium/http';
import { GuildService } from '../services/guild.service';

@HttpController('/guilds')
export class GuildController {
  constructor(
    private readonly bridge: BotBridge,
    private readonly guildService: GuildService,
  ) {}

  @HttpGet('/:guildId')
  async getGuild(@HttpParam('guildId') guildId: string) {
    const guild = await this.bridge.getGuild(guildId);
    if (!guild) throw new NotFoundError('Guild not found');
    return { ok: true, data: guild };
  }

  @HttpGet('/:guildId/stats')
  async getGuildStats(@HttpParam('guildId') guildId: string) {
    const stats = await this.guildService.getGuildStats(guildId);
    if (!stats) throw new NotFoundError('Guild not found');
    return { ok: true, data: stats };
  }

  @HttpGet('/:guildId/channels')
  async getGuildChannels(@HttpParam('guildId') guildId: string) {
    const channels = await this.guildService.getGuildChannels(guildId);
    if (!channels) throw new NotFoundError('Guild not found');
    return { ok: true, data: channels };
  }

  @HttpGet('/:guildId/bans')
  async getBans(@HttpParam('guildId') guildId: string) {
    const bans = await this.bridge.getBans(guildId);
    return { ok: true, data: bans };
  }

  @HttpGet('/:guildId/bans/:userId')
  async getBan(
    @HttpParam('guildId') guildId: string,
    @HttpParam('userId') userId: string,
  ) {
    const ban = await this.bridge.getBan(guildId, userId);
    if (!ban) throw new NotFoundError('Ban not found');
    return { ok: true, data: ban };
  }

  @HttpPost('/:guildId/bans')
  async banMember(
    @HttpParam('guildId') guildId: string,
    @HttpBody() body: { userId: string; reason?: string; deleteMessageDays?: number },
  ) {
    if (!body.userId) throw new BadRequestError('userId is required');
    const success = await this.bridge.banMember(guildId, body.userId, body.reason ?? 'No reason provided', {
      deleteMessageSeconds: (body.deleteMessageDays ?? 0) * 86_400,
    });
    if (!success) throw new BadRequestError('Failed to ban member');
    return { ok: true };
  }

  @HttpDelete('/:guildId/bans/:userId')
  async unbanMember(
    @HttpParam('guildId') guildId: string,
    @HttpParam('userId') userId: string,
  ) {
    const success = await this.bridge.unbanMember(guildId, userId);
    if (!success) throw new BadRequestError('Failed to unban member');
    return { ok: true };
  }
}
