import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { Injectable, type SpraxiumOnBoot, type SpraxiumOnShutdown } from '@spraxium/common';
import { AppEnv } from '../../app.env';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class {{PASCAL_NAME}}Service extends PrismaClient implements SpraxiumOnBoot, SpraxiumOnShutdown {
  constructor(private readonly env: AppEnv) {
    super({ adapter: new PrismaMariaDb(env.DATABASE_URL) });
  }

  /** Opens the database connection before the application handles interactions. */
  async onBoot(): Promise<void> {
    await this.$connect();
  }

  /** Releases the database connection when the application shuts down. */
  async onShutdown(): Promise<void> {
    await this.$disconnect();
  }
}
