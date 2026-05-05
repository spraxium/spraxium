import { Guard, GuardOption } from '@spraxium/common';
import type { ExecutionContext, SpraxiumGuard } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';

@Guard()
export class MinRolesGuard implements SpraxiumGuard {
  private logger: Logger = new Logger(MinRolesGuard.name);
  @GuardOption({ default: 9 })
  public minRoles!: number;

  public canActivate(ctx: ExecutionContext): boolean {
    this.logger.debug(`Checking if member has at least ${this.minRoles} roles...`);
    if (ctx.getGuildId() === null) return false;

    const interaction = ctx.getInteraction() as ChatInputCommandInteraction;
    const member = interaction.member as GuildMember | null;
    if (!member) return false;

    this.logger.debug(`Member has ${member.roles.cache.size - 1} roles (excluding @everyone).`);

    return member.roles.cache.size - 1 >= this.minRoles;
  }
}
