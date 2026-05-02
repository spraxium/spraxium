import Table from 'cli-table3';
import type { TableConstructorOptions } from 'cli-table3';

/**
 * Default style applied to all tables created by TableBuilder.
 * The border is rendered in dim ANSI, headers use no extra color by default
 * (callers apply ANSI helpers to head cell strings directly).
 */
export const TABLE_STYLE: TableConstructorOptions = {
  style: { head: [], border: ['dim'] },
};

/**
 * Static utility class for building `cli-table3` terminal tables with the
 * standard Spraxium style.  Import `TableBuilder` instead of `cli-table3`
 * directly so that all table output is routed through the logger package.
 *
 * @example
 *   const t = TableBuilder.create(['Name', 'Status']);
 *   t.push(['gateway', 'ready']);
 *   nativeLog(t.toString());
 */
export class TableBuilder {
  /**
   * Creates a new {@link Table} pre-configured with the Spraxium border style.
   *
   * @param head   Array of column header strings (apply `ANSI.*` for colour).
   * @param options Optional overrides merged on top of the default style.
   */
  static create(head: Array<string>, options?: Partial<TableConstructorOptions>): Table.Table {
    return new Table({ head, ...TABLE_STYLE, ...options });
  }
}
