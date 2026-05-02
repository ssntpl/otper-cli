import { Args } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { listCardComments } from '../../api/comments';
import { Comment } from '../../api/types';

const COLUMNS: Column<Comment>[] = [
  { header: 'ID', get: (c) => c.id },
  { header: 'Author', get: (c) => c.user?.name ?? '' },
  { header: 'Comment', get: (c) => c.comment },
  { header: 'Reactions', get: (c) =>
      (c.reactions ?? []).map((r) => `${r.reaction}×${r.users.length}`).join(' '),
  },
  { header: 'Created', get: (c) => c.created_at ?? '' },
];

export default class CardComments extends BaseCommand<typeof CardComments> {
  static description = 'List comments on a card (newest first).';

  static args = { id: Args.string({ description: 'Card ID', required: true }) };

  async run(): Promise<void> {
    const { args } = await this.parse(CardComments);
    const comments = await listCardComments(this.api, args.id);
    this.output(comments, { columns: COLUMNS });
  }
}
