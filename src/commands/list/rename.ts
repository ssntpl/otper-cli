import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { updateList } from '../../api/lists';
import { List } from '../../api/types';

const COLUMNS: Column<List>[] = [
  { header: 'ID', get: (l) => l.id },
  { header: 'Name', get: (l) => l.name },
];

export default class ListRename extends BaseCommand<typeof ListRename> {
  static description = 'Rename a list (also accepts --description / --color).';

  static args = { id: Args.string({ description: 'List ID', required: true }) };

  static flags = {
    name: Flags.string({ summary: 'New name' }),
    description: Flags.string({ summary: 'New description' }),
    color: Flags.string({ summary: 'New color' }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(ListRename);
    if (!this.flags.name && !this.flags.description && !this.flags.color) {
      this.error('Provide --name, --description, or --color.');
    }
    const list = await updateList(this.api, {
      id: args.id,
      name: this.flags.name,
      description: this.flags.description,
      color: this.flags.color,
    });
    this.output([list], { columns: COLUMNS, vertical: true, json: list });
  }
}
