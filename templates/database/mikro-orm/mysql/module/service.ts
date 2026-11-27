import { type EntityManager, MikroORM } from '@mikro-orm/mysql';
import { Injectable, type SpraxiumOnBoot, type SpraxiumOnShutdown } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { AppEnv } from '../../app.env';
import { User } from './entities/user.entity';

@Injectable()
export class {{PASCAL_NAME}}Service implements SpraxiumOnBoot, SpraxiumOnShutdown {
  private readonly logger = new Logger({{PASCAL_NAME}}Service.name);
  orm!: MikroORM;

  constructor(private readonly env: AppEnv) {}

  /** Creates an isolated entity manager for one unit of work. */
  get em(): EntityManager {
    return this.orm.em.fork();
  }

  /** Opens the database connection before the application handles interactions. */
  async onBoot(): Promise<void> {
    this.orm = await MikroORM.init({
      clientUrl: this.env.DATABASE_URL,
      entities: [User],
    });
    await this.orm.connect();
    this.logger.info('MikroORM initialized');
  }

  /** Releases the database connection when the application shuts down. */
  async onShutdown(): Promise<void> {
    await this.orm?.close();
    this.logger.info('MikroORM connection closed');
  }
}
