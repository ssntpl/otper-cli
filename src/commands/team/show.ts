import { Args } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { getTeam } from '../../api/teams';
import { Team } from '../../api/types';

const COLUMNS: Column<Team>[] = [
  { header: 'ID', get: (t) => t.id },
  { header: 'Slug', get: (t) => t.slug },
  { header: 'Name', get: (t) => t.name },
  { header: 'Personal', get: (t) => (t.personal_team ? 'yes' : 'no') },
  { header: 'Private', get: (t) => (t.is_private ? 'yes' : 'no') },
  { header: 'Members', get: (t) => t.users?.length ?? 0 },
  { header: 'Boards', get: (t) => t.boards?.length ?? 0 },
];

export default class TeamShow extends BaseCommand<typeof TeamShow> {
  static description = 'Show a team by ID, including members and boards.';
  static args = { id: Args.string({ description: 'Team ID', required: true }) };

  async run(): Promise<void> {
    const { args } = await this.parse(TeamShow);
    const team = await getTeam(this.api, args.id);
    if (!team) this.error(`Team ${args.id} not found.`);
    this.output([team], { columns: COLUMNS, vertical: true, json: team });
  }
}
