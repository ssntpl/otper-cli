import { BaseCommand } from '../base';
import { Column } from '../format';
import { me } from '../api/users';
import { User } from '../api/types';

const COLUMNS: Column<User>[] = [
  { header: 'ID', get: (u) => u.id },
  { header: 'Name', get: (u) => u.name },
  { header: 'Username', get: (u) => u.username },
  { header: 'Email', get: (u) => u.email ?? '' },
];

export default class Me extends BaseCommand<typeof Me> {
  static description = 'Alias for `auth:whoami`.';

  async run(): Promise<void> {
    const user = await me(this.api);
    this.output([user], { columns: COLUMNS, vertical: true });
  }
}
