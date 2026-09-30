import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { closeCard, reopenCard, updateCard, UpdateCardInput } from '../../api/cards';
import { Card } from '../../api/types';

const COLUMNS: Column<Card>[] = [
  { header: 'ID', get: (c) => c.id },
  { header: '#', get: (c) => c.card_number },
  { header: 'Title', get: (c) => c.title },
  { header: 'List', get: (c) => c.list?.name ?? '' },
  { header: 'Due', get: (c) => c.due_date ?? '' },
];

export default class CardUpdate extends BaseCommand<typeof CardUpdate> {
  static description = 'Update a card (title, description, due date, etc.).';

  static args = { id: Args.string({ description: 'Card ID', required: true }) };

  static flags = {
    title: Flags.string({ summary: 'New title' }),
    description: Flags.string({ summary: 'New description' }),
    'due-date': Flags.string({ summary: 'Due date (YYYY-MM-DD HH:MM:SS, or "null" to clear)' }),
    'start-time': Flags.string({ summary: 'Start time (DateTime, or "null" to clear)' }),
    'mark-done': Flags.boolean({
      summary: 'Mark due date complete',
      allowNo: true,
    }),
    archive: Flags.boolean({ summary: 'Archive (close) the card', exclusive: ['unarchive'] }),
    unarchive: Flags.boolean({ summary: 'Unarchive (reopen) the card' }),
    reason: Flags.string({ summary: 'Close reason (with --archive)', dependsOn: ['archive'] }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(CardUpdate);
    const input: UpdateCardInput = { id: args.id };
    if (this.flags.title !== undefined) input.title = this.flags.title;
    if (this.flags.description !== undefined) input.description = this.flags.description;
    if (this.flags['due-date'] !== undefined)
      input.due_date = this.flags['due-date'] === 'null' ? null : this.flags['due-date'];
    if (this.flags['start-time'] !== undefined)
      input.start_time = this.flags['start-time'] === 'null' ? null : this.flags['start-time'];
    if (this.flags['mark-done'] !== undefined) input.is_due_date_complete = this.flags['mark-done'];
    let card = Object.keys(input).length > 1 ? await updateCard(this.api, input) : undefined;
    if (this.flags.archive) card = await closeCard(this.api, args.id, this.flags.reason);
    if (this.flags.unarchive) card = await reopenCard(this.api, args.id);
    if (!card) this.error('Nothing to update.');
    this.output([card], { columns: COLUMNS, vertical: true, json: card });
  }
}
