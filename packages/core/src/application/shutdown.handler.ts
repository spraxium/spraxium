import { logger } from '@spraxium/logger';
import type { Client } from 'discord.js';
import type { ModuleLoader } from '../bootstrap';
import { PresenceManager } from '../client';
import { ProcessLock } from './lock';

const log = logger.child('ShutdownHandler');

export class ShutdownHandler {
  static register(client: Client, moduleLoader: ModuleLoader | undefined): void {
    const shutdown = async (signal: string): Promise<void> => {
      log.info(`Received ${signal}, shutting down`);

      ProcessLock.release();

      if (moduleLoader) {
        await moduleLoader.runShutdownHooks();
      }

      PresenceManager.stopRotation();
      client.destroy();
      log.info('Bot disconnected cleanly');
      await ShutdownHandler.drain(0);
    };

    process.once('SIGINT', () => void shutdown('SIGINT'));
    process.once('SIGTERM', () => void shutdown('SIGTERM'));
  }

  static drain(code: number): Promise<void> {
    return new Promise((resolve) => {
      setImmediate(() => {
        process.exit(code);
      });
    });
  }
}
