import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { getBoard, getBoardBySlug } from '../../api/boards';
import { Board } from '../../api/types';

const COLUMNS: Column<Board>[] = [
  { header: 'ID', get: (b) => b.id },
  { header: 'Slug', get: (b) => b.slug },
  { header: 'Key', get: (b) => b.key },
  { header: 'Name', get: (b) => b.name },
  { header: 'Description', get: (b) => b.description ?? '' },
  { header: 'Private', get: (b) => (b.is_private ? 'yes' : 'no') },
  { header: 'Latest #', get: (b) => b.latest_card_number },
  { header: 'Team', get: (b) => b.team?.slug ?? '' },
  { header: 'Lists', get: (b) => b.lists?.length ?? 0 },
  { header: 'Labels', get: (b) => b.labels?.length ?? 0 },
];

export default class BoardShow extends BaseCommand<typeof BoardShow> {
  static description = 'Show a board by ID, or by team-slug + board-slug.';

  static examples = [
    '<%= config.bin %> board:show 24',
    '<%= config.bin %> board:show --team ssntpl --slug taillog',
  ];

  static args = { id: Args.string({ description: 'Board ID', required: false }) };

  static flags = {
    team: Flags.string({ summary: 'Team slug (use with --slug)' }),
    slug: Flags.string({ summary: 'Board slug (use with --team)' }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(BoardShow);
    let board: Board | null;
    if (args.id) {
      board = await getBoard(this.api, args.id);
    } else if (this.flags.team && this.flags.slug) {
      board = await getBoardBySlug(this.api, this.flags.team, this.flags.slug);
    } else {
      this.error('Provide a board ID, or both --team and --slug.');
    }
    if (!board) this.error('Board not found.');
    this.output([board], { columns: COLUMNS, vertical: true, json: board });
  }
}
