import { Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { createBoard } from '../../api/boards';
import { Board } from '../../api/types';

const COLUMNS: Column<Board>[] = [
  { header: 'ID', get: (b) => b.id },
  { header: 'Slug', get: (b) => b.slug },
  { header: 'Key', get: (b) => b.key },
  { header: 'Name', get: (b) => b.name },
];

export default class BoardCreate extends BaseCommand<typeof BoardCreate> {
  static description = 'Create a new board in a team.';

  static examples = [
    '<%= config.bin %> board:create --team-id 16 --name "Engineering" --key ENG --slug engineering',
  ];

  static flags = {
    'team-id': Flags.string({ summary: 'Team ID to create the board in', required: true }),
    name: Flags.string({ summary: 'Board name (max 30)', required: true }),
    key: Flags.string({ summary: 'Card key prefix (max 20)', required: true }),
    slug: Flags.string({ summary: 'URL-friendly slug (max 64)', required: true }),
    description: Flags.string({ summary: 'Board description', default: '' }),
    private: Flags.boolean({ summary: 'Create as private board', default: false }),
  };

  async run(): Promise<void> {
    const board = await createBoard(this.api, {
      name: this.flags.name,
      key: this.flags.key,
      slug: this.flags.slug,
      description: this.flags.description,
      is_private: this.flags.private,
      team: { connect: this.flags['team-id'] },
    });
    this.output([board], { columns: COLUMNS, vertical: true, json: board });
  }
}
