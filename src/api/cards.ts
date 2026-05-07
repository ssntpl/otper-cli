import { OtperClient } from './client';
import { Card } from './types';

const CARD_FIELDS = /* GraphQL */ `
  id slug title description pos card_number rework total_working_time
  start_time end_time due_date is_due_date_complete archived_at created_at updated_at
`;

const CARD_QUERY = /* GraphQL */ `
  query Card($id: ID!) {
    card(id: $id) {
      ${CARD_FIELDS}
      board { id slug name key }
      list { id name }
      labels { id name color }
      users { id name username }
    }
  }
`;

const CARD_BY_SLUG = /* GraphQL */ `
  query CardBySlug($slug: String!) {
    cardBySlug(slug: $slug) {
      ${CARD_FIELDS}
      board { id slug name key }
      list { id name }
      labels { id name color }
      users { id name username }
    }
  }
`;

const CREATE_CARD = /* GraphQL */ `
  mutation CreateCard($input: createCardInput!) {
    createCard(input: $input) {
      ${CARD_FIELDS}
      list { id name }
    }
  }
`;

const UPDATE_CARD = /* GraphQL */ `
  mutation UpdateCard($input: UpdateCardInput!) {
    updateCard(input: $input) {
      ${CARD_FIELDS}
      list { id name }
      labels { id name color }
      users { id name username }
    }
  }
`;

const DELETE_CARD = /* GraphQL */ `
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id) { id title }
  }
`;

const MOVE_TO = /* GraphQL */ `
  mutation MoveTo($input: moveToInput!) {
    MoveTo(input: $input) { message }
  }
`;

export async function getCard(client: OtperClient, id: string): Promise<Card | null> {
  const data = await client.gql<{ card: Card | null }>(CARD_QUERY, { id });
  return data.card;
}

export async function getCardBySlug(client: OtperClient, slug: string): Promise<Card | null> {
  const data = await client.gql<{ cardBySlug: Card | null }>(CARD_BY_SLUG, { slug });
  return data.cardBySlug;
}

export interface CreateCardInput {
  title: string;
  description: string;
  list: { connect: string };
}

export async function createCard(client: OtperClient, input: CreateCardInput): Promise<Card> {
  const data = await client.gql<{ createCard: Card }>(CREATE_CARD, { input });
  return data.createCard;
}

export interface UpdateCardInput {
  id: string;
  title?: string;
  description?: string;
  color?: string;
  pos?: number;
  start_time?: string | null;
  due_date?: string | null;
  is_due_date_complete?: boolean;
  archived_at?: string | null;
  total_working_time?: string;
  list?: { connect: string };
  labels?: { connect?: string[]; disconnect?: string[] };
  users?: { connect?: { id: string; assigned_at: string }[]; disconnect?: string[] };
}

export async function updateCard(client: OtperClient, input: UpdateCardInput): Promise<Card> {
  const data = await client.gql<{ updateCard: Card }>(UPDATE_CARD, { input });
  return data.updateCard;
}

export async function deleteCard(client: OtperClient, id: string): Promise<Card> {
  const data = await client.gql<{ deleteCard: Card }>(DELETE_CARD, { id });
  return data.deleteCard;
}

export async function moveCard(
  client: OtperClient,
  cardId: string,
  toListId: string,
  overCardId?: string,
): Promise<{ message: string }> {
  const data = await client.gql<{ MoveTo: { message: string } }>(MOVE_TO, {
    input: { cardId, toListId, overCardId },
  });
  return data.MoveTo;
}
