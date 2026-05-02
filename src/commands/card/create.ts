import { Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { createCard } from '../../api/cards';
import { Card } from '../../api/types';

const COLUMNS: Column<Card>[] = [
  { header: 'ID', get: (c) => c.id },
  { header: '#', get: (c) => c.card_number },
  { header: 'Title', get: (c) => c.title },
  { header: 'List', get: (c) => c.list?.name ?? '' },
];

export default class CardCreate extends BaseCommand<typeof CardCreate> {
  static description = 'Create a card in a list.';

  static examples = [
    '<%= config.bin %> card:create --list 119 --title "Fix login bug" --description "Steps..."',
  ];

  static flags = {
    list: Flags.string({ summary: 'List ID to create the card in', required: true }),
    title: Flags.string({ summary: 'Card title (max 1024)', required: true }),
    description: Flags.string({ summary: 'Card description', default: '' }),
  };

  async run(): Promise<void> {
    const card = await createCard(this.api, {
      title: this.flags.title,
      description: this.flags.description,
      list: { connect: this.flags.list },
    });
    this.output([card], { columns: COLUMNS, vertical: true, json: card });
  }
}
