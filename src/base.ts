import { Command, Flags, Interfaces } from '@oclif/core';
import chalk from 'chalk';
import { OtperClient, OtperApiError } from './api/client';
import { resolveConfig } from './api/config';
import { Format, FormatOptions, formatOutput } from './format';

export type BaseFlags<T extends typeof Command> = Interfaces.InferredFlags<
  (typeof BaseCommand)['baseFlags'] & T['flags']
>;

export abstract class BaseCommand<T extends typeof Command> extends Command {
  static enableJsonFlag = false;

  static baseFlags = {
    format: Flags.string({
      summary: 'Output format',
      options: ['default', 'json', 'csv', 'silent'],
      default: 'default',
      helpGroup: 'GLOBAL',
    }),
    token: Flags.string({
      summary: 'Otper API token (overrides config and OTPER_TOKEN env)',
      env: 'OTPER_TOKEN',
      helpGroup: 'GLOBAL',
    }),
    'base-url': Flags.string({
      summary: 'Otper base URL (overrides config and OTPER_BASE_URL env)',
      env: 'OTPER_BASE_URL',
      helpGroup: 'GLOBAL',
    }),
    debug: Flags.boolean({
      summary: 'Print debug logs to stderr',
      default: false,
      helpGroup: 'GLOBAL',
    }),
  };

  protected flags!: BaseFlags<T>;
  protected api!: OtperClient;

  public async init(): Promise<void> {
    await super.init();
    const { flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      args: this.ctor.args,
      strict: this.ctor.strict,
    });
    this.flags = flags as BaseFlags<T>;
    if (!this.requiresAuth()) return;
    const cfg = resolveConfig({
      token: this.flags.token,
      baseUrl: this.flags['base-url'],
    });
    this.api = OtperClient.fromConfig(cfg, this.flags.debug);
  }

  /** Override to opt out of automatic auth (e.g. for `auth:login`). */
  protected requiresAuth(): boolean {
    return true;
  }

  /** Print rows according to the user's --format choice. */
  protected output<R>(rows: R[], opts: Omit<FormatOptions<R>, 'format'>): void {
    const out = formatOutput(rows, { ...opts, format: this.flags.format as Format });
    if (out) this.log(out);
  }

  protected async catch(err: Error & { exitCode?: number }): Promise<void> {
    if (err instanceof OtperApiError) {
      this.error(chalk.red(err.message), { exit: err.status === 401 ? 2 : 1 });
    }
    return super.catch(err);
  }
}
