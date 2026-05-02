import { ANSI, TableBuilder, nativeLog } from '@spraxium/logger';
import type { ResolvedContextMenuEntry } from '../context-menu/interfaces';
import type { ResolvedListenerEntry } from '../listeners/interfaces';
import type { ResolvedPrefixEntry } from '../prefix/interfaces';
import type { ResolvedSlashEntry } from '../slash/interfaces';
import type { ModuleRow } from './interfaces';

export function printBootTables(
  moduleRows: Array<ModuleRow>,
  listenerEntries: Array<ResolvedListenerEntry>,
  prefixEntries: Array<ResolvedPrefixEntry>,
  slashEntries: Array<ResolvedSlashEntry>,
  contextMenuEntries: Array<ResolvedContextMenuEntry> = [],
): void {
  if (process.env.SHARDS !== undefined) return;

  if (moduleRows.length > 0) {
    const modTable = TableBuilder.create([
      ANSI.bold(ANSI.cyan('Module')),
      ANSI.bold(ANSI.cyan('Providers')),
      ANSI.bold(ANSI.cyan('Listeners')),
      ANSI.bold(ANSI.cyan('Commands')),
      ANSI.bold(ANSI.cyan('Handlers')),
      ANSI.bold(ANSI.cyan('Exports')),
      ANSI.bold(ANSI.cyan('Global')),
    ]);

    for (const row of moduleRows) {
      modTable.push([
        ANSI.cyan(row.name),
        ANSI.green(String(row.providers)),
        ANSI.green(String(row.listeners)),
        ANSI.green(String(row.commands)),
        ANSI.green(String(row.handlers)),
        ANSI.dim(String(row.exports)),
        row.global ? ANSI.yellow('yes') : ANSI.dim('no'),
      ]);
    }

    nativeLog('');
    nativeLog(ANSI.bold(' Modules'));
    nativeLog(ANSI.dim(' All @Module() classes loaded in dependency order.'));
    nativeLog('');
    nativeLog(modTable.toString());
  }

  if (listenerEntries.length > 0) {
    const lisTable = TableBuilder.create([
      ANSI.bold(ANSI.cyan('Class')),
      ANSI.bold(ANSI.cyan('Event')),
      ANSI.bold(ANSI.cyan('Method')),
      ANSI.bold(ANSI.cyan('Type')),
    ]);

    for (const entry of listenerEntries) {
      lisTable.push([
        ANSI.cyan(entry.className),
        ANSI.green(entry.event),
        ANSI.dim(entry.method),
        entry.once ? ANSI.yellow('once') : ANSI.dim('on'),
      ]);
    }

    nativeLog('');
    nativeLog(ANSI.bold(' Listeners'));
    nativeLog(ANSI.dim(' All @Listener() handlers registered to Discord events.'));
    nativeLog('');
    nativeLog(lisTable.toString());
    nativeLog('');
  }

  if (prefixEntries.length > 0) {
    const cmdTable = TableBuilder.create([
      ANSI.bold(ANSI.cyan('Command')),
      ANSI.bold(ANSI.cyan('Aliases')),
      ANSI.bold(ANSI.cyan('Handler')),
      ANSI.bold(ANSI.cyan('Subcommand')),
      ANSI.bold(ANSI.cyan('Args')),
    ]);

    for (const entry of prefixEntries) {
      cmdTable.push([
        ANSI.cyan(entry.commandName),
        ANSI.dim(entry.aliases.join(', ') || ','),
        ANSI.green(entry.handlerClass),
        entry.subcommand ? ANSI.yellow(entry.subcommand) : ANSI.dim(','),
        ANSI.dim(String(entry.argCount)),
      ]);
    }

    nativeLog('');
    nativeLog(ANSI.bold(' Prefix Commands'));
    nativeLog(ANSI.dim(' All @PrefixCommand() handlers registered for message-based dispatch.'));
    nativeLog('');
    nativeLog(cmdTable.toString());
    nativeLog('');
  }

  if (slashEntries.length > 0) {
    const slashTable = TableBuilder.create([
      ANSI.bold(ANSI.cyan('Command')),
      ANSI.bold(ANSI.cyan('Handler')),
      ANSI.bold(ANSI.cyan('Group')),
      ANSI.bold(ANSI.cyan('Subcommand')),
      ANSI.bold(ANSI.cyan('Options')),
    ]);

    for (const entry of slashEntries) {
      slashTable.push([
        ANSI.cyan(`/${entry.commandName}`),
        ANSI.green(entry.handlerClass),
        entry.group ? ANSI.magenta(entry.group) : ANSI.dim('—'),
        entry.sub ? ANSI.yellow(entry.sub) : ANSI.dim('—'),
        ANSI.dim(String(entry.optionCount)),
      ]);
    }

    nativeLog('');
    nativeLog(ANSI.bold(' Slash Commands'));
    nativeLog(ANSI.dim(' All @SlashCommand() handlers registered for interaction-based dispatch.'));
    nativeLog('');
    nativeLog(slashTable.toString());
    nativeLog('');
  }

  if (contextMenuEntries.length > 0) {
    const cmTable = TableBuilder.create([
      ANSI.bold(ANSI.cyan('Command')),
      ANSI.bold(ANSI.cyan('Type')),
      ANSI.bold(ANSI.cyan('Handler')),
    ]);

    for (const entry of contextMenuEntries) {
      cmTable.push([
        ANSI.cyan(entry.commandName),
        entry.type === 'user' ? ANSI.magenta('user') : ANSI.yellow('message'),
        ANSI.green(entry.handlerClass),
      ]);
    }

    nativeLog('');
    nativeLog(ANSI.bold(' Context Menu Commands'));
    nativeLog(ANSI.dim(' All @ContextMenuCommand() handlers registered under the Apps submenu.'));
    nativeLog('');
    nativeLog(cmTable.toString());
    nativeLog('');
  }
}
