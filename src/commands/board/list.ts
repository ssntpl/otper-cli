import { Flags } from '@oclif/core';
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
  { header: 'Private', get: (b) => (b.is_private ? 'yes' : 'no') },
];

export default class BoardList extends BaseCommand<typeof BoardList> {
  static description = 'List boards (alias for board:search with empty query).';

  static flags = {
    query: Flags.string({ char: 'q', summary: 'Filter boards by name', default: '' }),
  };

  async run(): Promise<void> {
    const boards = await searchBoards(this.api, this.flags.query);
    this.output(boards, { columns: COLUMNS });
  }
}
