import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { getListWithCards } from '../../api/lists';
import { Card } from '../../api/types';

const CARD_COLUMNS: Column<Card>[] = [
  { header: 'ID', get: (c) => c.id },
  { header: '#', get: (c) => c.card_number },
  { header: 'Title', get: (c) => c.title },
  { header: 'Due', get: (c) => c.due_date ?? '' },
  { header: 'Labels', get: (c) => (c.labels ?? []).map((l) => l.name).join(',') },
  { header: 'Assignees', get: (c) => (c.users ?? []).map((u) => u.username).join(',') },
];

export default class ListShow extends BaseCommand<typeof ListShow> {
  static description = 'Show a list and the cards in it.';

  static args = { id: Args.string({ description: 'List ID', required: true }) };

  static flags = {
    page: Flags.integer({ summary: 'Page (25 cards per page)', default: 1 }),
    search: Flags.string({
      summary:
        'Filter cards (free text, or "labels:bug;assignee:john;status:not completed")',
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(ListShow);
    const list = await getListWithCards(this.api, args.id, this.flags.page, this.flags.search);
    if (!list) this.error(`List ${args.id} not found.`);
    if (this.flags.format === 'json') {
      this.log(JSON.stringify(list, null, 2));
      return;
    }
    if (this.flags.format === 'silent') return;
    this.log(`List: ${list.name} (id ${list.id})`);
    this.log(
      `Cards: ${list.cards.paginatorInfo.total} total, page ${list.cards.paginatorInfo.currentPage}/${list.cards.paginatorInfo.lastPage}`,
    );
    this.output(list.cards.data, { columns: CARD_COLUMNS });
  }
}
