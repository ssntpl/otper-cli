import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../base';
import { Column } from '../format';
import { searchBoards } from '../api/boards';
import { searchUsers } from '../api/users';
import { Board, User } from '../api/types';

const BOARD_COLS: Column<Board>[] = [
  { header: 'ID', get: (b) => b.id },
  { header: 'Slug', get: (b) => b.slug },
  { header: 'Name', get: (b) => b.name },
  { header: 'Team', get: (b) => b.team?.slug ?? '' },
];

const USER_COLS: Column<User>[] = [
  { header: 'ID', get: (u) => u.id },
  { header: 'Username', get: (u) => u.username },
  { header: 'Name', get: (u) => u.name },
  { header: 'Email', get: (u) => u.email ?? '' },
];

export default class Search extends BaseCommand<typeof Search> {
  static description = 'Search Otper. Defaults to boards; use --type users to search users.';

  static args = { query: Args.string({ description: 'Search query', required: true }) };

  static flags = {
    type: Flags.string({
      summary: 'What to search',
      options: ['boards', 'users'],
      default: 'boards',
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(Search);
    if (this.flags.type === 'users') {
      const rows = await searchUsers(this.api, args.query);
      this.output(rows, { columns: USER_COLS });
    } else {
      const rows = await searchBoards(this.api, args.query);
      this.output(rows, { columns: BOARD_COLS });
    }
  }
}
