import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import prompts from 'prompts';
import { BaseCommand } from '../../base';
import { deleteCard } from '../../api/cards';

export default class CardDelete extends BaseCommand<typeof CardDelete> {
  static description = 'Delete a card permanently.';

  static args = { id: Args.string({ description: 'Card ID', required: true }) };

  static flags = {
    yes: Flags.boolean({ char: 'y', summary: 'Skip confirmation', default: false }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(CardDelete);
    if (!this.flags.yes) {
      const r = await prompts({
        type: 'confirm',
        name: 'ok',
        message: `Delete card ${args.id}? This is permanent.`,
        initial: false,
      });
      if (!r.ok) {
        this.log(chalk.gray('Cancelled.'));
        return;
      }
    }
    const card = await deleteCard(this.api, args.id);
    if (this.flags.format !== 'silent') {
      this.log(`${chalk.green('✓')} Deleted card "${card.title}" (id ${card.id})`);
    }
  }
}
