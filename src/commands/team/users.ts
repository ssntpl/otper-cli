import { Args } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { getTeam } from '../../api/teams';
import { User } from '../../api/types';

const COLUMNS: Column<User>[] = [
  { header: 'ID', get: (u) => u.id },
  { header: 'Name', get: (u) => u.name },
  { header: 'Username', get: (u) => u.username },
  { header: 'Email', get: (u) => u.email ?? '' },
];

export default class TeamUsers extends BaseCommand<typeof TeamUsers> {
  static description = 'List members of a team.';
  static args = { id: Args.string({ description: 'Team ID', required: true }) };

  async run(): Promise<void> {
    const { args } = await this.parse(TeamUsers);
    const team = await getTeam(this.api, args.id);
    if (!team) this.error(`Team ${args.id} not found.`);
    this.output(team.users ?? [], { columns: COLUMNS });
  }
}
