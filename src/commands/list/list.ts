import { Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { getBoard, getBoardBySlug } from '../../api/boards';
import { List } from '../../api/types';

const COLUMNS: Column<List>[] = [
  { header: 'ID', get: (l) => l.id },
  { header: 'Name', get: (l) => l.name },
  { header: 'Pos', get: (l) => l.pos },
  { header: 'Color', get: (l) => l.color ?? '' },
  { header: 'Preferred', get: (l) => (l.preferred ? 'yes' : '') },
  { header: 'Hidden', get: (l) => (l.is_hidden ? 'yes' : '') },
  { header: 'Soft Limit', get: (l) => l.soft_card_limit },
  { header: 'Hard Limit', get: (l) => l.hard_card_limit },
];

export default class ListList extends BaseCommand<typeof ListList> {
  static description = 'List all lists on a board.';

  static examples = [
    '<%= config.bin %> list:list --board 7',
    '<%= config.bin %> list:list --team acme --slug engineering',
  ];

  static flags = {
    board: Flags.string({ summary: 'Board ID' }),
    team: Flags.string({ summary: 'Team slug (use with --slug)' }),
    slug: Flags.string({ summary: 'Board slug (use with --team)' }),
  };

  async run(): Promise<void> {
    let board;
    if (this.flags.board) {
      board = await getBoard(this.api, this.flags.board);
    } else if (this.flags.team && this.flags.slug) {
      board = await getBoardBySlug(this.api, this.flags.team, this.flags.slug);
    } else {
      this.error('Provide --board, or both --team and --slug.');
    }
    if (!board) this.error('Board not found.');
    this.output(board.lists ?? [], { columns: COLUMNS });
  }
}
