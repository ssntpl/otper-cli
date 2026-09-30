import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { unassignCardMember } from '../../api/cards';
import { Card } from '../../api/types';

const COLUMNS: Column<Card>[] = [
  { header: 'ID', get: (c) => c.id },
  { header: 'Title', get: (c) => c.title },
  { header: 'Assignees', get: (c) => (c.users ?? []).map((u) => u.name).join(', ') },
];

export default class CardUnassign extends BaseCommand<typeof CardUnassign> {
  static description = 'Unassign one or more users from a card.';

  static args = { id: Args.string({ description: 'Card ID', required: true }) };

  static flags = {
    user: Flags.string({ summary: 'User ID to remove (repeatable)', multiple: true, required: true }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(CardUnassign);
    // The API takes one user per call; the last response carries the final assignee list.
    let card!: Card;
    for (const userId of this.flags.user) card = await unassignCardMember(this.api, args.id, userId);
    this.output([card], { columns: COLUMNS, vertical: true, json: card });
  }
}
