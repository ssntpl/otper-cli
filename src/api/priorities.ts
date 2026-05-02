import { OtperClient } from './client';

export interface PriorityCard {
  id: string;
  title: string;
  card_number: string;
  slug: string;
  due_date?: string | null;
  priority: string;
  type: string;
  board: { id: string; slug: string; name: string; key: string };
  list?: { id: string; name: string } | null;
}

const TODAYS_PRIORITIES = /* GraphQL */ `
  query TodaysPriorities($user_id: Int!) {
    todaysPriorities(user_id: $user_id) {
      cards {
        id title card_number slug due_date priority type
        board { id slug name key }
        list { id name }
      }
    }
  }
`;

export async function todaysPriorities(
  client: OtperClient,
  userId: number,
): Promise<PriorityCard[]> {
  const data = await client.gql<{ todaysPriorities: { cards: PriorityCard[] } }>(
    TODAYS_PRIORITIES,
    { user_id: userId },
  );
  return data.todaysPriorities.cards;
}
