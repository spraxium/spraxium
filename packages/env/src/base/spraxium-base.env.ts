import { EnvSchema } from '../decorators/env-schema.decorator';
import { Env } from '../decorators/env.decorator';
import { IsDiscordId, IsDiscordToken, IsEnum, IsOptional } from '../decorators/validators';

@EnvSchema()
export class SpraxiumBaseEnv {
  @Env('DISCORD_TOKEN')
  @IsDiscordToken()
  token!: string;

  @Env('DISCORD_CLIENT_ID')
  @IsDiscordId()
  @IsOptional()
  clientId?: string;

  @Env('NODE_ENV', { default: 'development', secret: false })
  @IsEnum(['development', 'production', 'test', 'staging'])
  nodeEnv: 'development' | 'production' | 'test' | 'staging' = 'development';

  get<K extends keyof this>(key: K): this[K] {
    return this[key];
  }
}