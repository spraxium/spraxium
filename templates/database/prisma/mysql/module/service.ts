import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { Injectable, type SpraxiumOnBoot, type SpraxiumOnShutdown } from '@spraxium/common';
import { AppEnv } from '../../app.env';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class {{PASCAL_NAME}}Service extends PrismaClient implements SpraxiumOnBoot, SpraxiumOnShutdown {
  constructor(private readonly env: AppEnv) {
    super({ adapter: new PrismaMariaDb({ url: env.DATABASE_URL }) });
  }

  async onBoot(): Promise<void> {
    await this.$connect();
  }

  async onShutdown(): Promise<void> {
    await this.$disconnect();
  }
}
