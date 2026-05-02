import { Command } from '@oclif/core';
import chalk from 'chalk';
import { clearConfig, configPath } from '../../api/config';

export default class AuthLogout extends Command {
  static description = 'Delete the saved Otper credentials for the current profile.';

  async run(): Promise<void> {
    const file = configPath();
    const removed = clearConfig();
    if (removed) {
      this.log(`${chalk.green('✓')} Removed ${file}`);
    } else {
      this.log(`${chalk.gray('No credentials to remove.')}`);
    }
  }
}
