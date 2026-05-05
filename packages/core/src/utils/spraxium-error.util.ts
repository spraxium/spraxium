import { ANSI } from '@spraxium/logger';

function formatBlock(context: string, title: string, body: Array<string>, fix?: Array<string>): string {
  const lines: Array<string> = [];

  lines.push('');
  lines.push(`  ${ANSI.red('✖')}  ${ANSI.bold(ANSI.cyan(context))}  ${ANSI.gray(title)}`);
  lines.push('');

  for (const line of body) {
    lines.push(`     ${ANSI.gray(line)}`);
  }

  if (fix && fix.length > 0) {
    lines.push('');
    lines.push(`     ${ANSI.yellow('How to fix:')}`);
    for (const tip of fix) {
      lines.push(`       ${ANSI.dim(tip)}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

export function spraxiumError(
  context: string,
  title: string,
  body: Array<string>,
  fix?: Array<string>,
): never {
  process.stderr.write(`${formatBlock(context, title, body, fix)}\n`);
  throw new Error(`[${context}] ${title}`);
}

export function spraxiumFatal(
  context: string,
  title: string,
  body: Array<string>,
  fix?: Array<string>,
): never {
  process.stderr.write(`${formatBlock(context, title, body, fix)}\n`);
  process.exit(1);
}
