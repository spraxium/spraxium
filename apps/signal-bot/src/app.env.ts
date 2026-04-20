import { Env, EnvSchema, IsString, SpraxiumBaseEnv } from '@spraxium/env';

@EnvSchema()
export class AppEnv extends SpraxiumBaseEnv {
  @Env('SIGNAL_CHANNEL_ID')
  @IsString()
  SIGNAL_CHANNEL_ID!: string;

  @Env('SIGNAL_WEBHOOK_ID')
  @IsString()
  SIGNAL_WEBHOOK_ID!: string;

  @Env('SIGNAL_HMAC_SECRET')
  @IsString()
  SIGNAL_HMAC_SECRET!: string;
}
