import { Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { createList } from '../../api/lists';
import { List } from '../../api/types';

const COLUMNS: Column<List>[] = [
  { header: 'ID', get: (l) => l.id },
  { header: 'Name', get: (l) => l.name },
  { header: 'Pos', get: (l) => l.pos },
];

export default class ListCreate extends BaseCommand<typeof ListCreate> {
  static description = 'Create a new list on a board.';

  static flags = {
    board: Flags.string({ summary: 'Board ID', required: true }),
    name: Flags.string({ summary: 'List name', required: true }),
    description: Flags.string({ summary: 'List description', default: '' }),
    color: Flags.string({ summary: 'Color hex (e.g. #ff0000)' }),
    pos: Flags.string({ summary: 'Position string' }),
    preferred: Flags.boolean({ summary: 'Mark list as preferred', default: false }),
  };

  async run(): Promise<void> {
    const list = await createList(this.api, {
      name: this.flags.name,
      description: this.flags.description,
      color: this.flags.color,
      pos: this.flags.pos,
      preferred: this.flags.preferred,
      board: { connect: this.flags.board },
    });
    this.output([list], { columns: COLUMNS, vertical: true, json: list });
  }
}
