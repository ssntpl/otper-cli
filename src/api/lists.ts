import { OtperClient } from './client';
import { CardPaginator, List } from './types';

const LIST_FIELDS = /* GraphQL */ `
  id name description pos color preferred is_hidden
  soft_card_limit hard_card_limit card_limit
`;

const LIST_QUERY = /* GraphQL */ `
  query List($id: ID!) {
    list(id: $id) {
      ${LIST_FIELDS}
      board { id slug name key }
    }
  }
`;

const LIST_WITH_CARDS = /* GraphQL */ `
  query ListWithCards($id: ID!, $page: Int, $search: String) {
    list(id: $id) {
      ${LIST_FIELDS}
      cards(first: 25, page: $page, search: $search) {
        data {
          id slug title card_number pos due_date archived_at
          labels { id name color }
          users { id name username }
        }
        paginatorInfo { count currentPage hasMorePages lastPage perPage total }
      }
    }
  }
`;

const CREATE_LISTS = /* GraphQL */ `
  mutation CreateLists($input: CreateListsInput!) {
    createLists(input: $input) {
      ${LIST_FIELDS}
    }
  }
`;

const UPDATE_LISTS = /* GraphQL */ `
  mutation UpdateLists($input: UpdateListsInput!) {
    updateLists(input: $input) {
      ${LIST_FIELDS}
    }
  }
`;

const DELETE_LISTS = /* GraphQL */ `
  mutation DeleteLists($id: ID!) {
    deleteLists(id: $id) { id name }
  }
`;

const REORDER_LISTS = /* GraphQL */ `
  mutation ReorderLists($input: reorderListsInput!) {
    reorderLists(input: $input) { status message }
  }
`;

export async function getList(client: OtperClient, id: string): Promise<List | null> {
  const data = await client.gql<{ list: List | null }>(LIST_QUERY, { id });
  return data.list;
}

export async function getListWithCards(
  client: OtperClient,
  id: string,
  page = 1,
  search?: string,
): Promise<(List & { cards: CardPaginator }) | null> {
  const data = await client.gql<{ list: (List & { cards: CardPaginator }) | null }>(
    LIST_WITH_CARDS,
    { id, page, search },
  );
  return data.list;
}

export interface CreateListInput {
  name: string;
  description: string;
  color?: string;
  pos?: string;
  preferred: boolean;
  board: { connect: string };
}

export async function createList(client: OtperClient, input: CreateListInput): Promise<List> {
  const data = await client.gql<{ createLists: List }>(CREATE_LISTS, { input });
  return data.createLists;
}

export interface UpdateListInput {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  pos?: string;
  preferred?: boolean;
  soft_card_limit?: number;
  hard_card_limit?: number;
}

export async function updateList(client: OtperClient, input: UpdateListInput): Promise<List> {
  const data = await client.gql<{ updateLists: List }>(UPDATE_LISTS, { input });
  return data.updateLists;
}

export async function deleteList(client: OtperClient, id: string): Promise<List> {
  const data = await client.gql<{ deleteLists: List }>(DELETE_LISTS, { id });
  return data.deleteLists;
}

export async function reorderLists(
  client: OtperClient,
  activeListId: string,
  toListId: string,
): Promise<{ status: string; message: string }> {
  const data = await client.gql<{ reorderLists: { status: string; message: string } }>(
    REORDER_LISTS,
    { input: { activelistId: activeListId, toListId } },
  );
  return data.reorderLists;
}
