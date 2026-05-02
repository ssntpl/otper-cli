import { Flags } from '@oclif/core';
import { BaseCommand } from '../base';
import { Column } from '../format';
import { todaysPriorities, PriorityCard } from '../api/priorities';
import { me } from '../api/users';

const COLUMNS: Column<PriorityCard>[] = [
  { header: 'ID', get: (c) => c.id },
  { header: '#', get: (c) => c.card_number },
  { header: 'Title', get: (c) => c.title },
  { header: 'Priority', get: (c) => c.priority },
  { header: 'Type', get: (c) => c.type },
  { header: 'Due', get: (c) => c.due_date ?? '' },
  { header: 'Board', get: (c) => c.board?.name ?? '' },
  { header: 'List', get: (c) => c.list?.name ?? '' },
];

export default class Priorities extends BaseCommand<typeof Priorities> {
  static description = "Show today's priority cards for a user (defaults to current user).";

  static flags = {
    user: Flags.integer({ summary: 'User ID (defaults to authenticated user)' }),
  };

  async run(): Promise<void> {
    const userId = this.flags.user ?? Number((await me(this.api)).id);
    const cards = await todaysPriorities(this.api, userId);
    this.output(cards, { columns: COLUMNS });
  }
}
