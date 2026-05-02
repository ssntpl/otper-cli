import { Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { getBoard, getBoardBySlug } from '../../api/boards';
import { Label } from '../../api/types';

const COLUMNS: Column<Label>[] = [
  { header: 'ID', get: (l) => l.id },
  { header: 'Name', get: (l) => l.name },
  { header: 'Color', get: (l) => l.color ?? '' },
  { header: 'Description', get: (l) => l.description },
];

export default class LabelList extends BaseCommand<typeof LabelList> {
  static description = 'List all labels on a board.';

  static flags = {
    board: Flags.string({ summary: 'Board ID' }),
    team: Flags.string({ summary: 'Team slug (use with --slug)' }),
    slug: Flags.string({ summary: 'Board slug (use with --team)' }),
  };

  async run(): Promise<void> {
    let board;
    if (this.flags.board) board = await getBoard(this.api, this.flags.board);
    else if (this.flags.team && this.flags.slug)
      board = await getBoardBySlug(this.api, this.flags.team, this.flags.slug);
    else this.error('Provide --board, or both --team and --slug.');
    if (!board) this.error('Board not found.');
    this.output(board.labels ?? [], { columns: COLUMNS });
  }
}
