import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { updateComment } from '../../api/comments';
import { Comment } from '../../api/types';

const COLUMNS: Column<Comment>[] = [
  { header: 'ID', get: (c) => c.id },
  { header: 'Author', get: (c) => c.user?.name ?? '' },
  { header: 'Comment', get: (c) => c.comment },
];

export default class CommentUpdate extends BaseCommand<typeof CommentUpdate> {
  static description = 'Update a comment.';

  static args = { id: Args.string({ description: 'Comment ID', required: true }) };

  static flags = {
    text: Flags.string({ summary: 'New comment text', required: true, char: 't' }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(CommentUpdate);
    const comment = await updateComment(this.api, args.id, this.flags.text);
    this.output([comment], { columns: COLUMNS, vertical: true, json: comment });
  }
}
