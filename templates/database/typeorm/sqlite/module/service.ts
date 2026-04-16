import 'reflect-metadata';
import { Injectable, type SpraxiumOnBoot, type SpraxiumOnShutdown } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import { AppEnv } from '../../app.env';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class {{PASCAL_NAME}}Service implements SpraxiumOnBoot, SpraxiumOnShutdown {
  private readonly logger = new Logger({{PASCAL_NAME}}Service.name);
  dataSource!: DataSource;

  constructor(private readonly env: AppEnv) {}

  async onBoot(): Promise<void> {
    this.dataSource = new DataSource({
      type: 'better-sqlite3',
      database: this.env.DATABASE_PATH,
      entities: [User],
      synchronize: this.env.nodeEnv !== 'production',
    });
    await this.dataSource.initialize();
    this.logger.info('TypeORM DataSource initialized');
  }

  async onShutdown(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      this.logger.info('TypeORM DataSource destroyed');
    }
  }
}
