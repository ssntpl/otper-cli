import Table from 'cli-table3';
import chalk from 'chalk';

export type Format = 'default' | 'json' | 'csv' | 'silent';

export interface Column<T> {
  header: string;
  get: (row: T) => string | number | null | undefined;
  /** When set, default-format renders a vertical key/value pair instead of a row. */
  vertical?: boolean;
}

function toCell(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

export function renderTable<T>(rows: T[], columns: Column<T>[]): string {
  const table = new Table({
    head: columns.map((c) => chalk.bold(c.header)),
    style: { head: [], border: ['grey'] },
  });
  for (const row of rows) {
    table.push(columns.map((c) => toCell(c.get(row))));
  }
  return table.toString();
}

export function renderVertical<T>(row: T, columns: Column<T>[]): string {
  const lines: string[] = [];
  for (const c of columns) {
    lines.push(`${chalk.bold(c.header.padEnd(20))} ${toCell(c.get(row))}`);
  }
  return lines.join('\n');
}

export function renderCsv<T>(rows: T[], columns: Column<T>[]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [columns.map((c) => escape(c.header)).join(',')];
  for (const row of rows) {
    lines.push(columns.map((c) => escape(toCell(c.get(row)))).join(','));
  }
  return lines.join('\n');
}

export interface FormatOptions<T> {
  format: Format;
  /** Columns shown in default and csv output. */
  columns: Column<T>[];
  /** When true, default format renders a single record vertically. */
  vertical?: boolean;
  /** Raw value to emit when --format json is used. Defaults to the rows. */
  json?: unknown;
}

export function formatOutput<T>(rows: T[], opts: FormatOptions<T>): string {
  switch (opts.format) {
    case 'silent':
      return '';
    case 'json':
      return JSON.stringify(opts.json ?? rows, null, 2);
    case 'csv':
      return renderCsv(rows, opts.columns);
    case 'default':
    default:
      if (rows.length === 0) return chalk.gray('(no results)');
      if (opts.vertical && rows.length === 1) return renderVertical(rows[0], opts.columns);
      return renderTable(rows, opts.columns);
  }
}
