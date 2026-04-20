import {
  BadRequestError,
  HttpBody,
  BotBridge,
  HttpController,
  HttpDelete,
  HttpGet,
  NotFoundError,
  HttpParam,
  HttpPost,
} from '@spraxium/http';

@HttpController('/guilds')
export class MemberController {
  constructor(private readonly bridge: BotBridge) {}

  @HttpGet('/:guildId/members')
  async getMembers(@HttpParam('guildId') guildId: string) {
    const members = await this.bridge.getMembers(guildId);
    if (!members) throw new NotFoundError('Guild not found');
    return { ok: true, data: members };
  }

  @HttpGet('/:guildId/members/:userId')
  async getMember(
    @HttpParam('guildId') guildId: string,
    @HttpParam('userId') userId: string,
  ) {
    const member = await this.bridge.getMember(guildId, userId);
    if (!member) throw new NotFoundError('Member not found');
    return { ok: true, data: member };
  }

  @HttpDelete('/:guildId/members/:userId')
  async kickMember(
    @HttpParam('guildId') guildId: string,
    @HttpParam('userId') userId: string,
    @HttpBody() body: { reason?: string },
  ) {
    const success = await this.bridge.kickMember(guildId, userId, body.reason ?? 'No reason provided');
    if (!success) throw new BadRequestError('Failed to kick member');
    return { ok: true };
  }

  @HttpPost('/:guildId/members/:userId/timeout')
  async timeoutMember(
    @HttpParam('guildId') guildId: string,
    @HttpParam('userId') userId: string,
    @HttpBody() body: { durationMs: number; reason?: string },
  ) {
    if (!body.durationMs) throw new BadRequestError('durationMs is required');
    const success = await this.bridge.timeoutMember(
      guildId,
      userId,
      body.durationMs,
      body.reason ?? 'No reason provided',
    );
    if (!success) throw new BadRequestError('Failed to timeout member');
    return { ok: true };
  }

  @HttpDelete('/:guildId/members/:userId/timeout')
  async removeTimeout(
    @HttpParam('guildId') guildId: string,
    @HttpParam('userId') userId: string,
  ) {
    const success = await this.bridge.removeTimeoutMember(guildId, userId);
    if (!success) throw new BadRequestError('Failed to remove timeout');
    return { ok: true };
  }

  @HttpPost('/:guildId/members/:userId/roles/:roleId')
  async addRole(
    @HttpParam('guildId') guildId: string,
    @HttpParam('userId') userId: string,
    @HttpParam('roleId') roleId: string,
  ) {
    const success = await this.bridge.addRole(guildId, userId, roleId);
    if (!success) throw new BadRequestError('Failed to add role');
    return { ok: true };
  }

  @HttpDelete('/:guildId/members/:userId/roles/:roleId')
  async removeRole(
    @HttpParam('guildId') guildId: string,
    @HttpParam('userId') userId: string,
    @HttpParam('roleId') roleId: string,
  ) {
    const success = await this.bridge.removeRole(guildId, userId, roleId);
    if (!success) throw new BadRequestError('Failed to remove role');
    return { ok: true };
  }
}
