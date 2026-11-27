import { Injectable, type SpraxiumOnBoot, type SpraxiumOnShutdown } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { AppEnv } from '../../app.env';
import mongoose from 'mongoose';

@Injectable()
export class {{PASCAL_NAME}}Service implements SpraxiumOnBoot, SpraxiumOnShutdown {
  private readonly logger = new Logger({{PASCAL_NAME}}Service.name);

  constructor(private readonly env: AppEnv) {}

  /** Opens the database connection before the application handles interactions. */
  async onBoot(): Promise<void> {
    await mongoose.connect(this.env.DATABASE_URL);
    this.logger.info('Mongoose connected to MongoDB');
  }

  /** Releases the database connection when the application shuts down. */
  async onShutdown(): Promise<void> {
    await mongoose.disconnect();
    this.logger.info('Mongoose disconnected');
  }
}
