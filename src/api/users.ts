import { OtperClient } from './client';
import { User } from './types';

const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      id
      name
      username
      email
      current_team_id
      profile_photo_url
    }
  }
`;

const SEARCH_USERS = /* GraphQL */ `
  query SearchUsers($keyword: String!) {
    searchUsers(keyword: $keyword) {
      id
      name
      username
      email
    }
  }
`;

export async function me(client: OtperClient): Promise<User> {
  const data = await client.gql<{ me: User }>(ME_QUERY);
  return data.me;
}

export async function searchUsers(client: OtperClient, keyword: string): Promise<User[]> {
  const data = await client.gql<{ searchUsers: User[] }>(SEARCH_USERS, { keyword });
  return data.searchUsers;
}
