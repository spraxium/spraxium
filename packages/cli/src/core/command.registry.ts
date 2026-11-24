import { Command } from 'commander';
import pkg from '../../package.json';
import type { CliCommand } from '../interfaces';

export class CommandRegistry {
  private readonly program: Command;

  constructor(private readonly commands: Array<CliCommand>) {
    this.program = new Command()
      .name('spraxium')
      .description('Spraxium Framework CLI \u2014 build Discord bots at scale')
      .version(pkg.version);
  }

  registerAll(): void {
    for (const cmd of this.commands) cmd.register(this.program);
  }

  async parse(): Promise<void> {
    await this.program.parseAsync();
  }
}
