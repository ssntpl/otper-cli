import { OtperClient } from './client';
import { Board } from './types';

const BOARD_FIELDS = /* GraphQL */ `
  id
  slug
  name
  key
  description
  is_private
  latest_card_number
  archived_at
  created_at
  updated_at
`;

const BOARD_QUERY = /* GraphQL */ `
  query Board($id: ID!) {
    board(id: $id) {
      ${BOARD_FIELDS}
      team { id slug name }
      lists { id name pos color preferred is_hidden soft_card_limit hard_card_limit card_limit }
      labels { id name color description }
    }
  }
`;

const BOARD_BY_SLUG_QUERY = /* GraphQL */ `
  query BoardByTeamAndSlug($team_slug: String!, $slug: String!) {
    boardByTeamAndBoardSlug(team_slug: $team_slug, slug: $slug) {
      ${BOARD_FIELDS}
      team { id slug name }
      lists { id name pos color preferred is_hidden soft_card_limit hard_card_limit card_limit }
      labels { id name color description }
    }
  }
`;

const SEARCH_BOARDS_QUERY = /* GraphQL */ `
  query SearchBoards($query: String!) {
    searchBoards(query: $query) {
      ${BOARD_FIELDS}
      team { id slug name }
    }
  }
`;

const CREATE_BOARD = /* GraphQL */ `
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      ${BOARD_FIELDS}
    }
  }
`;

const UPDATE_BOARD = /* GraphQL */ `
  mutation UpdateBoard($input: UpdateBoardInput!) {
    updateBoard(input: $input) {
      ${BOARD_FIELDS}
    }
  }
`;

export async function getBoard(client: OtperClient, id: string): Promise<Board | null> {
  const data = await client.gql<{ board: Board | null }>(BOARD_QUERY, { id });
  return data.board;
}

export async function getBoardBySlug(
  client: OtperClient,
  teamSlug: string,
  boardSlug: string,
): Promise<Board | null> {
  const data = await client.gql<{ boardByTeamAndBoardSlug: Board | null }>(BOARD_BY_SLUG_QUERY, {
    team_slug: teamSlug,
    slug: boardSlug,
  });
  return data.boardByTeamAndBoardSlug;
}

export async function searchBoards(client: OtperClient, query: string): Promise<Board[]> {
  const data = await client.gql<{ searchBoards: Board[] }>(SEARCH_BOARDS_QUERY, { query });
  return data.searchBoards;
}

export interface CreateBoardInput {
  name: string;
  key: string;
  slug: string;
  description: string;
  is_private: boolean;
  team: { connect: string };
  lists?: { create: { name: string; description?: string; pos: number; color?: string }[] };
}

export async function createBoard(client: OtperClient, input: CreateBoardInput): Promise<Board> {
  const data = await client.gql<{ createBoard: Board }>(CREATE_BOARD, { input });
  return data.createBoard;
}

export interface UpdateBoardInput {
  id: string;
  name?: string;
  description?: string;
  is_private?: boolean;
  archived_at?: string | null;
}

export async function updateBoard(client: OtperClient, input: UpdateBoardInput): Promise<Board> {
  const data = await client.gql<{ updateBoard: Board }>(UPDATE_BOARD, { input });
  return data.updateBoard;
}
