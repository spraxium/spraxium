import { type EntityManager, MikroORM } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { Injectable, type SpraxiumOnBoot, type SpraxiumOnShutdown } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { AppEnv } from '../../app.env';
import { User } from './entities/user.entity';

@Injectable()
export class {{PASCAL_NAME}}Service implements SpraxiumOnBoot, SpraxiumOnShutdown {
  private readonly logger = new Logger({{PASCAL_NAME}}Service.name);
  orm!: MikroORM;

  constructor(private readonly env: AppEnv) {}

  get em(): EntityManager {
    return this.orm.em.fork();
  }

  async onBoot(): Promise<void> {
    this.orm = await MikroORM.init({
      driver: SqliteDriver,
      dbName: this.env.DATABASE_PATH,
      entities: [User],
    });
    this.logger.info('MikroORM initialized');
  }

  async onShutdown(): Promise<void> {
    await this.orm.close();
    this.logger.info('MikroORM connection closed');
  }
}
