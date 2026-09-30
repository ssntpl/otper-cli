import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { assignCardMember } from '../../api/cards';
import { Card } from '../../api/types';

const COLUMNS: Column<Card>[] = [
  { header: 'ID', get: (c) => c.id },
  { header: 'Title', get: (c) => c.title },
  { header: 'Assignees', get: (c) => (c.users ?? []).map((u) => u.name).join(', ') },
];

export default class CardAssign extends BaseCommand<typeof CardAssign> {
  static description = 'Assign one or more users to a card.';

  static examples = ['<%= config.bin %> card:assign 1234 --user 15 --user 22'];

  static args = { id: Args.string({ description: 'Card ID', required: true }) };

  static flags = {
    user: Flags.string({ summary: 'User ID (repeatable)', multiple: true, required: true }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(CardAssign);
    // The API takes one user per call; the last response carries the final assignee list.
    let card!: Card;
    for (const userId of this.flags.user) card = await assignCardMember(this.api, args.id, userId);
    this.output([card], { columns: COLUMNS, vertical: true, json: card });
  }
}
