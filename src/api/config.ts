import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export interface OtperConfig {
  baseUrl: string;
  token: string;
  team?: string;
  board?: string;
}

export const DEFAULT_BASE_URL = 'https://otper.com';
const CONFIG_DIR = path.join(os.homedir(), '.otper-cli');

function profileDir(profile: string): string {
  return path.join(CONFIG_DIR, profile);
}

export function configPath(profile: string = currentProfile()): string {
  return path.join(profileDir(profile), 'config.json');
}

export function currentProfile(): string {
  return process.env.OTPER_PROFILE || 'default';
}

export function loadConfig(profile: string = currentProfile()): OtperConfig | null {
  const file = configPath(profile);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as OtperConfig;
  } catch {
    return null;
  }
}

export function saveConfig(config: OtperConfig, profile: string = currentProfile()): string {
  const dir = profileDir(profile);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const file = configPath(profile);
  fs.writeFileSync(file, JSON.stringify(config, null, 2), { mode: 0o600 });
  return file;
}

export function clearConfig(profile: string = currentProfile()): boolean {
  const file = configPath(profile);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}

export function resolveConfig(overrides: Partial<OtperConfig> = {}): OtperConfig {
  const file = loadConfig();
  const baseUrl =
    overrides.baseUrl || process.env.OTPER_BASE_URL || file?.baseUrl || DEFAULT_BASE_URL;
  const token = overrides.token || process.env.OTPER_TOKEN || file?.token || '';
  const team = overrides.team || process.env.OTPER_TEAM || file?.team;
  const board = overrides.board || process.env.OTPER_BOARD || file?.board;
  if (!token) {
    throw new Error(
      'Not authenticated. Run `otper auth:login` or set OTPER_TOKEN.',
    );
  }
  return { baseUrl, token, team, board };
}
