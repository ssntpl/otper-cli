import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { updateCard } from '../../api/cards';
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
    const card = await updateCard(this.api, {
      id: args.id,
      users: { disconnect: this.flags.user },
    });
    this.output([card], { columns: COLUMNS, vertical: true, json: card });
  }
}
