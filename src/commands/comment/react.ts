import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { reactToComment } from '../../api/comments';
import { Comment } from '../../api/types';

const COLUMNS: Column<Comment>[] = [
  { header: 'ID', get: (c) => c.id },
  { header: 'Reactions', get: (c) =>
      (c.reactions ?? []).map((r) => `${r.reaction}×${r.users.length}`).join(' '),
  },
];

export default class CommentReact extends BaseCommand<typeof CommentReact> {
  static description =
    'Toggle a reaction on a comment. Use plain keywords (like, love, laugh, wow, sad, angry).';

  static examples = [
    '<%= config.bin %> comment:react 4567 --reaction like',
    '<%= config.bin %> comment:react 4567 --remove',
  ];

  static args = { id: Args.string({ description: 'Comment ID', required: true }) };

  static flags = {
    reaction: Flags.string({ summary: 'Reaction keyword (omit with --remove to clear)' }),
    remove: Flags.boolean({ summary: 'Remove your reaction', default: false }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(CommentReact);
    if (!this.flags.reaction && !this.flags.remove) {
      this.error('Provide --reaction or --remove.');
    }
    const reaction = this.flags.remove ? null : (this.flags.reaction ?? null);
    const comment = await reactToComment(this.api, args.id, reaction);
    this.output([comment], { columns: COLUMNS, vertical: true, json: comment });
  }
}
