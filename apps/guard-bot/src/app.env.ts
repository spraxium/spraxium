import { Env, EnvSchema, IsDiscordId, SpraxiumBaseEnv } from '@spraxium/env';

/**
 * Extends the base env with VIP_ROLE_ID, the Discord role snowflake
 * that VipRoleGuard checks against.
 */
@EnvSchema()
export class AppEnv extends SpraxiumBaseEnv {
  @Env('VIP_ROLE_ID')
  @IsDiscordId()
  vipRoleId!: string;
}
