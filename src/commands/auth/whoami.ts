import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { me } from '../../api/users';
import { User } from '../../api/types';

const COLUMNS: Column<User>[] = [
  { header: 'ID', get: (u) => u.id },
  { header: 'Name', get: (u) => u.name },
  { header: 'Username', get: (u) => u.username },
  { header: 'Email', get: (u) => u.email ?? '' },
  { header: 'Current Team', get: (u) => u.current_team_id ?? '' },
];

export default class AuthWhoami extends BaseCommand<typeof AuthWhoami> {
  static description = 'Show the user the current token authenticates as.';

  async run(): Promise<void> {
    const user = await me(this.api);
    this.output([user], { columns: COLUMNS, vertical: true });
  }
}
