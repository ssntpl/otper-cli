import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { updateLabel } from '../../api/labels';
import { Label } from '../../api/types';

const COLUMNS: Column<Label>[] = [
  { header: 'ID', get: (l) => l.id },
  { header: 'Name', get: (l) => l.name },
  { header: 'Color', get: (l) => l.color ?? '' },
];

export default class LabelUpdate extends BaseCommand<typeof LabelUpdate> {
  static description = 'Update a label.';

  static args = { id: Args.string({ description: 'Label ID', required: true }) };

  static flags = {
    name: Flags.string({ summary: 'New name' }),
    description: Flags.string({ summary: 'New description' }),
    color: Flags.string({ summary: 'New color' }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(LabelUpdate);
    if (!this.flags.name && !this.flags.description && !this.flags.color) {
      this.error('Provide at least one of --name, --description, --color.');
    }
    const label = await updateLabel(this.api, {
      id: args.id,
      name: this.flags.name,
      description: this.flags.description,
      color: this.flags.color,
    });
    this.output([label], { columns: COLUMNS, vertical: true, json: label });
  }
}
