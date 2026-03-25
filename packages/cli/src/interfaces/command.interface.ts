import type { Command } from 'commander';

export interface ICommand {
  register(program: Command): void;
}
