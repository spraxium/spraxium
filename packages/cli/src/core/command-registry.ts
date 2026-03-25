import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import type { CommandInterface } from '../interfaces';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf-8')) as {
      version?: string;
    };
    return pkg.version ?? '0.0.1';
  } catch {
    return '0.0.1';
  }
}

/**
 * Owns the Commander program instance and wires up all CommandInterface registrations.
 * OCP: new commands are added by passing them into the constructor array — never by modifying this class.
 */
export class CommandRegistry {
  private readonly program: Command;

  constructor(private readonly commands: Array<CommandInterface>) {
    this.program = new Command()
      .name('spraxium')
      .description('Spraxium Framework CLI \u2014 build Discord bots at scale')
      .version(readVersion());
  }

  registerAll(): void {
    for (const cmd of this.commands) cmd.register(this.program);
  }

  parse(): void {
    this.program.parse();
  }
}
