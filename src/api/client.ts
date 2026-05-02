import { OtperConfig } from './config';

export interface ClientOptions {
  baseUrl: string;
  token: string;
  debug?: boolean;
}

export interface GraphQLError {
  message: string;
  path?: (string | number)[];
  extensions?: Record<string, unknown>;
}

export class OtperApiError extends Error {
  status: number;
  errors?: GraphQLError[];
  body?: unknown;
  constructor(message: string, status: number, errors?: GraphQLError[], body?: unknown) {
    super(message);
    this.name = 'OtperApiError';
    this.status = status;
    this.errors = errors;
    this.body = body;
  }
}

/**
 * Otper API client.
 *
 * Wraps the GraphQL endpoint at `${baseUrl}/graphql` and the REST endpoints
 * under `${baseUrl}/api/v1/`. The same Bearer token authenticates both.
 *
 * Designed to be reusable as a library — instantiate directly or build it
 * from a saved config via `OtperClient.fromConfig`.
 */
export class OtperClient {
  readonly baseUrl: string;
  readonly token: string;
  readonly debug: boolean;

  constructor(opts: ClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.token = opts.token;
    this.debug = !!opts.debug;
  }

  static fromConfig(config: OtperConfig, debug = false): OtperClient {
    return new OtperClient({ baseUrl: config.baseUrl, token: config.token, debug });
  }

  /** Run a GraphQL query or mutation and return the data. */
  async gql<T = unknown>(
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<T> {
    const url = `${this.baseUrl}/graphql`;
    const body = JSON.stringify({ query, variables });
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.error(`[otper] POST ${url}`);
      // eslint-disable-next-line no-console
      console.error(`[otper] vars: ${JSON.stringify(variables)}`);
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body,
    });
    const text = await res.text();
    let parsed: { data?: T; errors?: GraphQLError[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new OtperApiError(`Non-JSON response (${res.status}): ${text.slice(0, 200)}`, res.status);
    }
    if (parsed.errors?.length) {
      const msg = parsed.errors.map((e) => e.message).join('; ');
      throw new OtperApiError(`GraphQL error: ${msg}`, res.status, parsed.errors, parsed);
    }
    if (!res.ok) {
      throw new OtperApiError(`HTTP ${res.status}: ${text.slice(0, 200)}`, res.status, undefined, parsed);
    }
    return parsed.data as T;
  }

  /** Call a REST endpoint under /api/. Returns the parsed JSON body. */
  async rest<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    pathname: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}/api/${pathname.replace(/^\//, '')}`;
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.error(`[otper] ${method} ${url}`);
    }
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new OtperApiError(`HTTP ${res.status}: ${text.slice(0, 300)}`, res.status);
    }
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }
}
