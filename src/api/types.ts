/**
 * Shared resource types used across the API layer.
 * These mirror the Otper GraphQL schema (~/Developer/otper-backend/graphql/*.graphql).
 */

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  current_team_id?: string | null;
  profile_photo_url?: string | null;
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  personal_team: boolean;
  is_private: boolean;
  created_at?: string;
  updated_at?: string;
  users?: User[];
  boards?: Board[];
}

export interface Board {
  id: string;
  slug: string;
  name: string;
  key: string;
  description?: string | null;
  is_private: boolean;
  archived_at?: string | null;
  latest_card_number: number;
  invite_link?: string | null;
  created_at?: string;
  updated_at?: string;
  team?: Team;
  lists?: List[];
  labels?: Label[];
}

export interface List {
  id: string;
  name: string;
  description: string;
  pos: string;
  color?: string | null;
  preferred: boolean;
  is_hidden: boolean;
  soft_card_limit: number;
  hard_card_limit: number;
  card_limit: number;
  board?: Board;
  cards?: Card[];
}

export interface Label {
  id: string;
  name: string;
  description: string;
  color?: string | null;
  board?: Board;
}

export interface Card {
  id: string;
  slug: string;
  title: string;
  description: string;
  pos: number;
  card_number: string;
  rework?: string | null;
  total_working_time?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  due_date?: string | null;
  is_due_date_complete?: boolean | null;
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string;
  board?: Board;
  list?: List;
  labels?: Label[];
  users?: User[];
}

export interface Comment {
  id: string;
  comment: string;
  edited_at?: string | null;
  created_at?: string;
  reply_to_comment_id?: string | null;
  user: User;
  card?: Card;
  reactions?: { reaction: string; users: User[] }[];
}

export interface PaginatorInfo {
  count: number;
  currentPage: number;
  hasMorePages: boolean;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface CardPaginator {
  data: Card[];
  paginatorInfo: PaginatorInfo;
}
