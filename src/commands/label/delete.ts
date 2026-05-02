import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import prompts from 'prompts';
import { BaseCommand } from '../../base';
import { deleteLabel } from '../../api/labels';

export default class LabelDelete extends BaseCommand<typeof LabelDelete> {
  static description = 'Delete a label.';

  static args = { id: Args.string({ description: 'Label ID', required: true }) };

  static flags = {
    yes: Flags.boolean({ char: 'y', summary: 'Skip confirmation', default: false }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(LabelDelete);
    if (!this.flags.yes) {
      const r = await prompts({
        type: 'confirm',
        name: 'ok',
        message: `Delete label ${args.id}?`,
        initial: false,
      });
      if (!r.ok) {
        this.log(chalk.gray('Cancelled.'));
        return;
      }
    }
    const label = await deleteLabel(this.api, args.id);
    if (this.flags.format !== 'silent') {
      this.log(`${chalk.green('✓')} Deleted label "${label.name}" (id ${label.id})`);
    }
  }
}
