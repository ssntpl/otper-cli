import { OtperClient } from './client';
import { Label } from './types';

const LABEL_FIELDS = /* GraphQL */ `id name description color`;

const LABEL_QUERY = /* GraphQL */ `
  query Label($id: ID!) {
    label(id: $id) {
      ${LABEL_FIELDS}
      board { id slug name }
    }
  }
`;

const CREATE_LABEL = /* GraphQL */ `
  mutation CreateLabel($input: LabelInput!) {
    createLabel(input: $input) { ${LABEL_FIELDS} }
  }
`;

const UPDATE_LABEL = /* GraphQL */ `
  mutation UpdateLabel($input: updateLabelInput!) {
    updateLabel(input: $input) { ${LABEL_FIELDS} }
  }
`;

const DELETE_LABEL = /* GraphQL */ `
  mutation DeleteLabel($id: ID!) {
    deleteLabel(id: $id) { id name }
  }
`;

export async function getLabel(client: OtperClient, id: string): Promise<Label | null> {
  const data = await client.gql<{ label: Label | null }>(LABEL_QUERY, { id });
  return data.label;
}

export interface CreateLabelInput {
  name: string;
  description: string;
  color?: string;
  board?: { connect: string };
}

export async function createLabel(client: OtperClient, input: CreateLabelInput): Promise<Label> {
  const data = await client.gql<{ createLabel: Label }>(CREATE_LABEL, { input });
  return data.createLabel;
}

export interface UpdateLabelInput {
  id: string;
  name?: string;
  description?: string;
  color?: string;
}

export async function updateLabel(client: OtperClient, input: UpdateLabelInput): Promise<Label> {
  const data = await client.gql<{ updateLabel: Label }>(UPDATE_LABEL, { input });
  return data.updateLabel;
}

export async function deleteLabel(client: OtperClient, id: string): Promise<Label> {
  const data = await client.gql<{ deleteLabel: Label }>(DELETE_LABEL, { id });
  return data.deleteLabel;
}
