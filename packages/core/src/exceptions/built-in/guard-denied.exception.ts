import { SpraxiumException } from '../spraxium.exception';

/**
 * Thrown when a guard denies access to a command.
 *
 * Prefer throwing this over returning `false` when you want the exception
 * system to handle the reply , it keeps guards lean and reply logic out of guard code.
 *
 * Available props in layout templates:
 * - `{{guardName}}` , the class name of the guard that denied (optional)
 * - `{{reason}}` , machine-readable reason string (optional)
 *
 * @example
 * async canActivate(ctx: ExecutionContext): Promise<boolean> {
 *   if (!ctx.getGuildId()) throw new GuardDeniedException({ guardName: 'GuildOnly' });
 *   return true;
 * }
 */
export class GuardDeniedException extends SpraxiumException {
  constructor(props?: { guardName?: string; reason?: string } & Record<string, unknown>) {
    super({
      code: 'GUARD_DENIED',
      message: 'You are not allowed to execute this command.',
      props: props ?? {},
    });
  }
}
