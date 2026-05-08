import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { OtperClient, OtperApiError, GraphQLError } from './client';

/**
 * Otper file uploads ride on the apollo-upload-client multipart spec
 * against the GraphQL `upload` mutation. Two non-obvious requirements:
 *
 *   1. The `X-Requested-With: XMLHttpRequest` header is mandatory —
 *      Lighthouse's EnsureXHR middleware rejects multipart POSTs without it.
 *   2. `owner.connect.type` must be the literal Eloquent class FQN with
 *      single backslashes (e.g. `App\Models\Card`). The resolver matches
 *      with a `switch` on `Card::class`, so any other form falls through.
 *
 * The REST endpoint `POST /api/v1/.../fileUp` exists but is gated by an
 * ability that personal tokens lack — GraphQL is the only path that works.
 */

const OWNER_FQN: Record<string, string> = {
  Card: 'App\\Models\\Card',
  Comment: 'App\\Models\\Comment',
  UserActivity: 'App\\Models\\UserActivity',
};

const UPLOAD_MUTATION = /* GraphQL */ `
  mutation Upload(
    $file: Upload!
    $type: String!
    $disk: String!
    $card_id: ID!
    $owner: OwnerBelongsToInput!
  ) {
    upload(
      input: {
        file: $file
        type: $type
        disk: $disk
        card_id: $card_id
        owner: $owner
      }
    )
  }
`;

export type OwnerType = 'Card' | 'Comment' | 'UserActivity';

export interface UploadedFile {
  id: number | string;
  type: string;
  name: string;
  key: string;
  disk: string;
  size: number;
  checksum: string | null;
  created_at?: string;
  updated_at?: string;
  owner?: unknown;
}

export interface UploadInput {
  /** ID of the card the file belongs to (required even when attaching to a comment). */
  cardId: string | number;
  /** What the file is attached to. Defaults to `Card`. */
  ownerType?: OwnerType;
  /** ID of the owner record (comment id, activity id). Defaults to `cardId` when ownerType is Card. */
  ownerId?: string | number;
  /** Local file path. */
  filePath: string;
  /** Override the filename sent to the server. Defaults to basename(filePath). */
  filename?: string;
  /** Override MIME type. Defaults to a small extension-based mapping. */
  mimeType?: string;
  /** Storage disk; the resolver ignores the value but the schema requires non-empty. */
  disk?: string;
}

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.zip': 'application/zip',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
};

function detectMime(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

/**
 * Upload a file and attach it to a card (or to a comment / user activity
 * recorded against a card). Returns the resolver's JSON payload.
 */
export async function uploadFile(
  client: OtperClient,
  input: UploadInput,
): Promise<UploadedFile> {
  const ownerType = input.ownerType ?? 'Card';
  const ownerFqn = OWNER_FQN[ownerType];
  if (!ownerFqn) throw new Error(`Unsupported owner type: ${ownerType}`);

  const cardId = String(input.cardId);
  const ownerId = String(input.ownerId ?? cardId);
  const buf = await fs.readFile(input.filePath);
  const filename = input.filename ?? path.basename(input.filePath);
  const mimeType = input.mimeType ?? detectMime(input.filePath);
  const disk = input.disk ?? 's3';

  const operations = {
    query: UPLOAD_MUTATION,
    variables: {
      file: null,
      type: ownerType,
      disk,
      card_id: cardId,
      owner: { connect: { id: ownerId, type: ownerFqn } },
    },
  };
  const map = { '0': ['variables.file'] };

  const form = new FormData();
  form.append('operations', JSON.stringify(operations));
  form.append('map', JSON.stringify(map));
  form.append('0', new Blob([buf], { type: mimeType }), filename);

  const url = `${client.baseUrl}/graphql`;
  if (client.debug) {
    // eslint-disable-next-line no-console
    console.error(`[otper] POST (multipart) ${url} file=${filename} (${buf.length} bytes)`);
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${client.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: form,
  });
  const text = await res.text();
  let parsed: { data?: { upload: UploadedFile }; errors?: GraphQLError[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new OtperApiError(
      `Non-JSON upload response (${res.status}): ${text.slice(0, 200)}`,
      res.status,
    );
  }
  if (parsed.errors?.length) {
    const msg = parsed.errors.map((e) => e.message).join('; ');
    throw new OtperApiError(`GraphQL upload error: ${msg}`, res.status, parsed.errors, parsed);
  }
  if (!res.ok || !parsed.data) {
    throw new OtperApiError(
      `HTTP ${res.status}: ${text.slice(0, 200)}`,
      res.status,
      undefined,
      parsed,
    );
  }
  return parsed.data.upload;
}
