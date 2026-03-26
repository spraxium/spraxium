import type { Command } from 'commander';

export interface CliCommand {
  register(program: Command): void;
}
