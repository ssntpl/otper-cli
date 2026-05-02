import { Args } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../base';
import { reorderLists } from '../../api/lists';

export default class ListReorder extends BaseCommand<typeof ListReorder> {
  static description = 'Reorder a list to be placed relative to another list.';

  static args = {
    id: Args.string({ description: 'List ID being moved', required: true }),
    'to-id': Args.string({ description: 'List ID to place it relative to', required: true }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(ListReorder);
    const res = await reorderLists(this.api, args.id, args['to-id']);
    if (this.flags.format === 'json') {
      this.log(JSON.stringify(res, null, 2));
    } else if (this.flags.format !== 'silent') {
      this.log(`${chalk.green('✓')} ${res.message}`);
    }
  }
}
