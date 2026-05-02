import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { getCard, getCardBySlug } from '../../api/cards';
import { Card } from '../../api/types';

const COLUMNS: Column<Card>[] = [
  { header: 'ID', get: (c) => c.id },
  { header: 'Slug', get: (c) => c.slug },
  { header: '#', get: (c) => c.card_number },
  { header: 'Title', get: (c) => c.title },
  { header: 'Description', get: (c) => c.description },
  { header: 'List', get: (c) => c.list?.name ?? '' },
  { header: 'Board', get: (c) => c.board?.name ?? '' },
  { header: 'Due', get: (c) => c.due_date ?? '' },
  { header: 'Done', get: (c) => (c.is_due_date_complete ? 'yes' : '') },
  { header: 'Labels', get: (c) => (c.labels ?? []).map((l) => l.name).join(', ') },
  { header: 'Assignees', get: (c) => (c.users ?? []).map((u) => u.name).join(', ') },
  { header: 'Created', get: (c) => c.created_at ?? '' },
  { header: 'Updated', get: (c) => c.updated_at ?? '' },
];

export default class CardShow extends BaseCommand<typeof CardShow> {
  static description = 'Show a card by ID or by slug.';

  static args = { id: Args.string({ description: 'Card ID', required: false }) };

  static flags = {
    slug: Flags.string({ summary: 'Card slug (alternative to ID)' }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(CardShow);
    let card: Card | null;
    if (args.id) card = await getCard(this.api, args.id);
    else if (this.flags.slug) card = await getCardBySlug(this.api, this.flags.slug);
    else this.error('Provide a card ID or --slug.');
    if (!card) this.error('Card not found.');
    this.output([card], { columns: COLUMNS, vertical: true, json: card });
  }
}
