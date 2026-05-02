import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import prompts from 'prompts';
import { OtperClient } from '../../api/client';
import { DEFAULT_BASE_URL, saveConfig } from '../../api/config';
import { me } from '../../api/users';

export default class AuthLogin extends Command {
  static description = 'Save Otper API credentials to ~/.otper-cli/<profile>/config.json';

  static examples = [
    '<%= config.bin %> auth:login',
    '<%= config.bin %> auth:login --token 123|abcdef --base-url https://otper.com',
    'OTPER_PROFILE=ssntpl <%= config.bin %> auth:login',
  ];

  static args = {
    token: Args.string({
      description: 'Otper API token (Bearer). Prompts if omitted.',
      required: false,
    }),
  };

  static flags = {
    token: Flags.string({ summary: 'Otper API token (alternative to positional arg)' }),
    'base-url': Flags.string({ summary: 'Otper base URL', default: DEFAULT_BASE_URL }),
    team: Flags.string({ summary: 'Default team slug to use for commands' }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AuthLogin);
    let token = args.token || flags.token;
    if (!token) {
      const r = await prompts({
        type: 'password',
        name: 'token',
        message: 'Otper API token',
        validate: (v: string) => (v ? true : 'Token is required'),
      });
      token = r.token;
    }
    if (!token) this.error('No token provided.');

    const baseUrl = (flags['base-url'] || DEFAULT_BASE_URL).replace(/\/$/, '');
    const client = new OtperClient({ baseUrl, token });
    const user = await me(client).catch((err) => {
      this.error(`Token rejected: ${err.message}`);
    });

    const file = saveConfig({ baseUrl, token, team: flags.team });
    this.log(
      `${chalk.green('✓')} Authenticated as ${chalk.bold(user.name)} (@${user.username})`,
    );
    this.log(`  ${chalk.gray('saved to')} ${file}`);
  }
}
