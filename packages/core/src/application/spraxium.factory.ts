import { ANSI } from '@spraxium/logger';
import { version as djsVersion } from 'discord.js';
import pkg from '../../package.json';
import { isShardChild } from '../client';
import type { SpraxiumOptions } from './interfaces';
import { SpraxiumApplication } from './spraxium.application';

export class SpraxiumFactory {
  public static async create(options: SpraxiumOptions = {}): Promise<SpraxiumApplication> {
    const startedAt = Date.now();

    // Shard children inherit stdout from the parent, so skip the banner to
    // avoid N duplicate header lines (one per shard). The parent prints it.
    if (!isShardChild()) {
      process.stdout.write(
        `\n  ${ANSI.yellow('\u2605')}  ${ANSI.bold('spraxium')}  ${ANSI.gray(`v${pkg.version}`)}  ${ANSI.bold(`discord.js v${djsVersion}`)}\n\n`,
      );
    }

    return new SpraxiumApplication(options, startedAt);
  }
}
