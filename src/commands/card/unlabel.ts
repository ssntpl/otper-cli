import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { updateCard } from '../../api/cards';
import { Card } from '../../api/types';

const COLUMNS: Column<Card>[] = [
  { header: 'ID', get: (c) => c.id },
  { header: 'Title', get: (c) => c.title },
  { header: 'Labels', get: (c) => (c.labels ?? []).map((l) => l.name).join(', ') },
];

export default class CardUnlabel extends BaseCommand<typeof CardUnlabel> {
  static description = 'Detach one or more labels from a card.';

  static args = { id: Args.string({ description: 'Card ID', required: true }) };

  static flags = {
    label: Flags.string({ summary: 'Label ID to remove (repeatable)', multiple: true, required: true }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(CardUnlabel);
    const card = await updateCard(this.api, {
      id: args.id,
      labels: { disconnect: this.flags.label },
    });
    this.output([card], { columns: COLUMNS, vertical: true, json: card });
  }
}
