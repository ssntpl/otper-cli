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

export default class CardLabel extends BaseCommand<typeof CardLabel> {
  static description = 'Attach one or more labels to a card.';

  static args = { id: Args.string({ description: 'Card ID', required: true }) };

  static flags = {
    label: Flags.string({ summary: 'Label ID (repeatable)', multiple: true, required: true }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(CardLabel);
    const card = await updateCard(this.api, {
      id: args.id,
      labels: { connect: this.flags.label },
    });
    this.output([card], { columns: COLUMNS, vertical: true, json: card });
  }
}
