/**
 * Library entry point for embedding @ssntpl/otper-cli inside other Node apps
 * (for example, openclaw plugins).
 *
 * Example:
 *   import { OtperClient, boards } from '@ssntpl/otper-cli';
 *   const client = new OtperClient({ baseUrl: 'https://otper.com', token: '...' });
 *   const board = await boards.getBoard(client, '24');
 */

export { OtperClient, OtperApiError, ClientOptions, GraphQLError } from './api/client';
export {
  OtperConfig,
  loadConfig,
  saveConfig,
  clearConfig,
  resolveConfig,
  configPath,
  currentProfile,
  DEFAULT_BASE_URL,
} from './api/config';

export * from './api/types';
export * as boards from './api/boards';
export * as lists from './api/lists';
export * as cards from './api/cards';
export * as labels from './api/labels';
export * as comments from './api/comments';
export * as users from './api/users';
export * as teams from './api/teams';
export * as priorities from './api/priorities';
