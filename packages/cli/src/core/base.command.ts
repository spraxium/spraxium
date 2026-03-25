import type { Command } from 'commander';
import type { ICommand } from '../interfaces';
import type { CliLogger } from '../ui/cli-logger';

/**
 * Base class for all CLI commands.
 * SRP: handles error wrapping and exit, nothing else.
 * OCP: subclasses extend behavior by implementing register() and their own execute().
 */
export abstract class BaseCommand implements ICommand {
  constructor(protected readonly logger: CliLogger) {}

  abstract register(program: Command): void;

  protected async run(fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.name === 'ExitPromptError') {
        process.exit(0);
      }
      this.logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  }
}
