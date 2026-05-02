import { Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { createLabel } from '../../api/labels';
import { Label } from '../../api/types';

const COLUMNS: Column<Label>[] = [
  { header: 'ID', get: (l) => l.id },
  { header: 'Name', get: (l) => l.name },
  { header: 'Color', get: (l) => l.color ?? '' },
];

export default class LabelCreate extends BaseCommand<typeof LabelCreate> {
  static description = 'Create a label on a board.';

  static flags = {
    board: Flags.string({ summary: 'Board ID', required: true }),
    name: Flags.string({ summary: 'Label name', required: true }),
    description: Flags.string({ summary: 'Label description', default: '' }),
    color: Flags.string({ summary: 'Hex color (e.g. #ff5722)' }),
  };

  async run(): Promise<void> {
    const label = await createLabel(this.api, {
      name: this.flags.name,
      description: this.flags.description,
      color: this.flags.color,
      board: { connect: this.flags.board },
    });
    this.output([label], { columns: COLUMNS, vertical: true, json: label });
  }
}
