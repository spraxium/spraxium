import { Env, EnvSchema, IsString, SpraxiumBaseEnv } from '@spraxium/env';

@EnvSchema()
export class AppEnv extends SpraxiumBaseEnv {
  @Env('DATABASE_URL')
  @IsString()
  DATABASE_URL!: string;
}
