import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import { BaseCommand } from '../../base';
import { moveCard } from '../../api/cards';

export default class CardMove extends BaseCommand<typeof CardMove> {
  static description = 'Move a card to another list, optionally above a specific card.';

  static examples = [
    '<%= config.bin %> card:move 1234 --to-list 138',
    '<%= config.bin %> card:move 1234 --to-list 138 --over 1235',
  ];

  static args = { id: Args.string({ description: 'Card ID', required: true }) };

  static flags = {
    'to-list': Flags.string({ summary: 'Destination list ID', required: true }),
    over: Flags.string({ summary: 'Card ID to place this card above' }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(CardMove);
    const res = await moveCard(this.api, args.id, this.flags['to-list'], this.flags.over);
    if (this.flags.format === 'json') {
      this.log(JSON.stringify(res, null, 2));
    } else if (this.flags.format !== 'silent') {
      this.log(`${chalk.green('✓')} ${res.message}`);
    }
  }
}
