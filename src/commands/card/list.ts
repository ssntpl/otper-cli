import { Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { getListWithCards } from '../../api/lists';
import { Card } from '../../api/types';

const COLUMNS: Column<Card>[] = [
  { header: 'ID', get: (c) => c.id },
  { header: '#', get: (c) => c.card_number },
  { header: 'Title', get: (c) => c.title },
  { header: 'Due', get: (c) => c.due_date ?? '' },
  { header: 'Labels', get: (c) => (c.labels ?? []).map((l) => l.name).join(',') },
  { header: 'Assignees', get: (c) => (c.users ?? []).map((u) => u.username).join(',') },
];

export default class CardList extends BaseCommand<typeof CardList> {
  static description = 'List cards in a list (paginated, 25 per page).';

  static examples = [
    '<%= config.bin %> card:list --list 119',
    '<%= config.bin %> card:list --list 119 --search "labels:bug;assignee:harsh"',
  ];

  static flags = {
    list: Flags.string({ summary: 'List ID', required: true }),
    page: Flags.integer({ summary: 'Page number', default: 1 }),
    search: Flags.string({
      summary:
        'Filter (free text, or "labels:bug;assignee:john;status:not completed;due date:overdue")',
    }),
  };

  async run(): Promise<void> {
    const list = await getListWithCards(this.api, this.flags.list, this.flags.page, this.flags.search);
    if (!list) this.error(`List ${this.flags.list} not found.`);
    this.output(list.cards.data, { columns: COLUMNS, json: list.cards });
  }
}
