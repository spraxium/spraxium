import { SlashCommand, SlashOption, SlashSubcommand } from '@spraxium/common';

// Flat subcommands — no subcommand groups.
// Each subcommand has its own @SlashOption decorators and its own handler.
//
//   /math add <a> <b>
//   /math subtract <a> <b>
//   /math multiply <a> <b>

@SlashCommand({ name: 'math', description: 'Basic math operations.' })
export class MathCommand {
  @SlashOption.Number('a', { description: 'First number', required: true })
  @SlashOption.Number('b', { description: 'Second number', required: true })
  @SlashSubcommand({ name: 'add', description: 'Add two numbers' })
  add() {}

  @SlashOption.Number('a', { description: 'First number', required: true })
  @SlashOption.Number('b', { description: 'Second number', required: true })
  @SlashSubcommand({ name: 'subtract', description: 'Subtract b from a' })
  subtract() {}

  @SlashOption.Number('a', { description: 'First number', required: true })
  @SlashOption.Number('b', { description: 'Second number', required: true })
  @SlashSubcommand({ name: 'multiply', description: 'Multiply two numbers' })
  multiply() {}
}
