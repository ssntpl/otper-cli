import { Args } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { searchBoards } from '../../api/boards';
import { Board } from '../../api/types';

const COLUMNS: Column<Board>[] = [
  { header: 'ID', get: (b) => b.id },
  { header: 'Slug', get: (b) => b.slug },
  { header: 'Key', get: (b) => b.key },
  { header: 'Name', get: (b) => b.name },
  { header: 'Team', get: (b) => b.team?.slug ?? '' },
];

export default class BoardSearch extends BaseCommand<typeof BoardSearch> {
  static description = 'Search boards by name.';
  static args = { query: Args.string({ description: 'Search query', required: true }) };

  async run(): Promise<void> {
    const { args } = await this.parse(BoardSearch);
    const boards = await searchBoards(this.api, args.query);
    this.output(boards, { columns: COLUMNS });
  }
}
