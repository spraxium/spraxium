import 'reflect-metadata';
import { Injectable, type SpraxiumOnBoot, type SpraxiumOnShutdown } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import { AppEnv } from '../../app.env';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class DatabaseService implements SpraxiumOnBoot, SpraxiumOnShutdown {
  private readonly logger = new Logger(DatabaseService.name);
  dataSource!: DataSource;

  constructor(private readonly env: AppEnv) {}

  async onBoot(): Promise<void> {
    this.dataSource = new DataSource({
      type: 'postgres',
      url: this.env.DATABASE_URL,
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
