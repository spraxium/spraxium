import { Env, EnvSchema, IsPort, SpraxiumBaseEnv } from '@spraxium/env';

@EnvSchema()
export class AppEnv extends SpraxiumBaseEnv {
  @Env('PORT')
  @IsPort()
  port!: number;
}
