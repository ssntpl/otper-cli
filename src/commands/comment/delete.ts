import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import prompts from 'prompts';
import { BaseCommand } from '../../base';
import { deleteComment } from '../../api/comments';

export default class CommentDelete extends BaseCommand<typeof CommentDelete> {
  static description = 'Delete a comment.';

  static args = { id: Args.string({ description: 'Comment ID', required: true }) };

  static flags = {
    yes: Flags.boolean({ char: 'y', summary: 'Skip confirmation', default: false }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(CommentDelete);
    if (!this.flags.yes) {
      const r = await prompts({
        type: 'confirm',
        name: 'ok',
        message: `Delete comment ${args.id}?`,
        initial: false,
      });
      if (!r.ok) {
        this.log(chalk.gray('Cancelled.'));
        return;
      }
    }
    await deleteComment(this.api, args.id);
    if (this.flags.format !== 'silent') {
      this.log(`${chalk.green('✓')} Deleted comment ${args.id}`);
    }
  }
}
