import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { createComment } from '../../api/comments';
import { Comment } from '../../api/types';

const COLUMNS: Column<Comment>[] = [
  { header: 'ID', get: (c) => c.id },
  { header: 'Author', get: (c) => c.user?.name ?? '' },
  { header: 'Comment', get: (c) => c.comment },
  { header: 'Created', get: (c) => c.created_at ?? '' },
];

export default class CardComment extends BaseCommand<typeof CardComment> {
  static description = 'Add a comment to a card.';

  static args = { id: Args.string({ description: 'Card ID', required: true }) };

  static flags = {
    text: Flags.string({ summary: 'Comment text', required: true, char: 't' }),
    'reply-to': Flags.string({ summary: 'Reply to a specific comment ID' }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(CardComment);
    const comment = await createComment(this.api, {
      comment: this.flags.text,
      card: { connect: args.id },
      reply_to_comment_id: this.flags['reply-to'],
    });
    this.output([comment], { columns: COLUMNS, vertical: true, json: comment });
  }
}
