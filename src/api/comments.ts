import { OtperClient } from './client';
import { Comment } from './types';

const COMMENT_FIELDS = /* GraphQL */ `
  id comment edited_at created_at reply_to_comment_id
  user { id name username }
`;

const COMMENT_QUERY = /* GraphQL */ `
  query Comment($id: ID!) {
    comment(id: $id) {
      ${COMMENT_FIELDS}
      reactions { reaction users { id name username } }
    }
  }
`;

const CREATE_COMMENT = /* GraphQL */ `
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) { ${COMMENT_FIELDS} }
  }
`;

const UPDATE_COMMENT = /* GraphQL */ `
  mutation UpdateComment($input: updateCommentInput!) {
    updateComment(input: $input) { ${COMMENT_FIELDS} }
  }
`;

const DELETE_COMMENT = /* GraphQL */ `
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id) { id }
  }
`;

const COMMENT_REACTION = /* GraphQL */ `
  mutation CommentReaction($id: String!, $reaction: String) {
    commentReaction(id: $id, reaction: $reaction) {
      ${COMMENT_FIELDS}
      reactions { reaction users { id name } }
    }
  }
`;

const CARD_COMMENTS = /* GraphQL */ `
  query CardComments($id: ID!) {
    card(id: $id) {
      id
      chronologicalComments(first: 50) {
        data { ${COMMENT_FIELDS} reactions { reaction users { id name } } }
        paginatorInfo { total hasMorePages currentPage }
      }
    }
  }
`;

export async function getComment(client: OtperClient, id: string): Promise<Comment | null> {
  const data = await client.gql<{ comment: Comment | null }>(COMMENT_QUERY, { id });
  return data.comment;
}

export interface CreateCommentInput {
  comment: string;
  card?: { connect: string };
  board?: { connect: string };
  reply_to_comment_id?: string;
}

export async function createComment(
  client: OtperClient,
  input: CreateCommentInput,
): Promise<Comment> {
  const data = await client.gql<{ createComment: Comment }>(CREATE_COMMENT, { input });
  return data.createComment;
}

export async function updateComment(
  client: OtperClient,
  id: string,
  comment: string,
): Promise<Comment> {
  const data = await client.gql<{ updateComment: Comment }>(UPDATE_COMMENT, {
    input: { id, comment },
  });
  return data.updateComment;
}

export async function deleteComment(client: OtperClient, id: string): Promise<{ id: string }> {
  const data = await client.gql<{ deleteComment: { id: string } }>(DELETE_COMMENT, { id });
  return data.deleteComment;
}

export async function reactToComment(
  client: OtperClient,
  id: string,
  reaction: string | null,
): Promise<Comment> {
  const data = await client.gql<{ commentReaction: Comment }>(COMMENT_REACTION, {
    id,
    reaction,
  });
  return data.commentReaction;
}

export async function listCardComments(
  client: OtperClient,
  cardId: string,
): Promise<Comment[]> {
  const data = await client.gql<{
    card: { chronologicalComments: { data: Comment[] } } | null;
  }>(CARD_COMMENTS, { id: cardId });
  return data.card?.chronologicalComments?.data ?? [];
}
