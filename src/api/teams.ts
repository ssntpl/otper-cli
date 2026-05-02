import { OtperClient } from './client';
import { Team } from './types';

const TEAM_QUERY = /* GraphQL */ `
  query Team($id: ID!) {
    team(id: $id) {
      id
      slug
      name
      personal_team
      is_private
      created_at
      users {
        id
        name
        username
        email
      }
      boards {
        id
        slug
        name
        key
        is_private
      }
    }
  }
`;

export async function getTeam(client: OtperClient, id: string): Promise<Team | null> {
  const data = await client.gql<{ team: Team | null }>(TEAM_QUERY, { id });
  return data.team;
}
