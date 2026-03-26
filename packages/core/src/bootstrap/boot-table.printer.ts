import chalk from 'chalk';
import Table from 'cli-table3';
import type { ResolvedListenerEntry } from '../listeners/interfaces';
import type { ResolvedPrefixEntry } from '../prefix/interfaces';
import type { ResolvedSlashEntry } from '../slash/interfaces';
import { TABLE_STYLE } from './constants';
import type { ModuleRow } from './interfaces';

export function printBootTables(
  moduleRows: Array<ModuleRow>,
  listenerEntries: Array<ResolvedListenerEntry>,
  prefixEntries: Array<ResolvedPrefixEntry>,
  slashEntries: Array<ResolvedSlashEntry>,
): void {
  if (process.env.SHARDS !== undefined) return;

  if (moduleRows.length > 0) {
    const modTable = new Table({
      head: [
        chalk.bold.cyan('Module'),
        chalk.bold.cyan('Providers'),
        chalk.bold.cyan('Listeners'),
        chalk.bold.cyan('Commands'),
        chalk.bold.cyan('Handlers'),
        chalk.bold.cyan('Exports'),
        chalk.bold.cyan('Global'),
      ],
      ...TABLE_STYLE,
    });

    for (const row of moduleRows) {
      modTable.push([
        chalk.cyan(row.name),
        chalk.green(String(row.providers)),
        chalk.green(String(row.listeners)),
        chalk.green(String(row.commands)),
        chalk.green(String(row.handlers)),
        chalk.dim(String(row.exports)),
        row.global ? chalk.yellow('yes') : chalk.dim('no'),
      ]);
    }

    console.log('');
    console.log(chalk.bold(' Modules'));
    console.log(chalk.dim(' All @Module() classes loaded in dependency order.'));
    console.log('');
    console.log(modTable.toString());
  }

  if (listenerEntries.length > 0) {
    const lisTable = new Table({
      head: [
        chalk.bold.cyan('Class'),
        chalk.bold.cyan('Event'),
        chalk.bold.cyan('Method'),
        chalk.bold.cyan('Type'),
      ],
      ...TABLE_STYLE,
    });

    for (const entry of listenerEntries) {
      lisTable.push([
        chalk.cyan(entry.className),
        chalk.green(entry.event),
        chalk.dim(entry.method),
        entry.once ? chalk.yellow('once') : chalk.dim('on'),
      ]);
    }

    console.log('');
    console.log(chalk.bold(' Listeners'));
    console.log(chalk.dim(' All @Listener() handlers registered to Discord events.'));
    console.log('');
    console.log(lisTable.toString());
    console.log('');
  }

  if (prefixEntries.length > 0) {
    const cmdTable = new Table({
      head: [
        chalk.bold.cyan('Command'),
        chalk.bold.cyan('Aliases'),
        chalk.bold.cyan('Handler'),
        chalk.bold.cyan('Subcommand'),
        chalk.bold.cyan('Args'),
      ],
      ...TABLE_STYLE,
    });

    for (const entry of prefixEntries) {
      cmdTable.push([
        chalk.cyan(entry.commandName),
        chalk.dim(entry.aliases.join(', ') || '—'),
        chalk.green(entry.handlerClass),
        entry.subcommand ? chalk.yellow(entry.subcommand) : chalk.dim('—'),
        chalk.dim(String(entry.argCount)),
      ]);
    }

    console.log('');
    console.log(chalk.bold(' Prefix Commands'));
    console.log(chalk.dim(' All @PrefixCommand() handlers registered for message-based dispatch.'));
    console.log('');
    console.log(cmdTable.toString());
    console.log('');
  }

  if (slashEntries.length > 0) {
    const slashTable = new Table({
      head: [
        chalk.bold.cyan('Command'),
        chalk.bold.cyan('Handler'),
        chalk.bold.cyan('Group'),
        chalk.bold.cyan('Subcommand'),
        chalk.bold.cyan('Options'),
      ],
      ...TABLE_STYLE,
    });

    for (const entry of slashEntries) {
      slashTable.push([
        chalk.cyan(`/${entry.commandName}`),
        chalk.green(entry.handlerClass),
        entry.group ? chalk.magenta(entry.group) : chalk.dim('—'),
        entry.sub ? chalk.yellow(entry.sub) : chalk.dim('—'),
        chalk.dim(String(entry.optionCount)),
      ]);
    }

    console.log('');
    console.log(chalk.bold(' Slash Commands'));
    console.log(chalk.dim(' All @SlashCommand() handlers registered for interaction-based dispatch.'));
    console.log('');
    console.log(slashTable.toString());
    console.log('');
  }
}
