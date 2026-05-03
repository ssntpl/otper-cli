# otper-cli

[![npm version](https://img.shields.io/npm/v/otper-cli.svg)](https://www.npmjs.com/package/otper-cli)
[![License](https://img.shields.io/npm/l/otper-cli.svg)](LICENSE)

Command-line interface for [Otper](https://otper.com) — manage boards, lists, cards, labels, and comments from your terminal. Talks directly to the Otper GraphQL API and is also embeddable as a Node library.

```sh
npm install -g otper-cli
otper auth:login
otper board:search "taillog"
otper card:list --list 119
```

## Contents

- [Install](#install)
- [Authentication](#authentication)
- [Configuration](#configuration)
- [Command reference](#command-reference)
- [Output formats](#output-formats)
- [Library usage](#library-usage)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Install

Requires **Node.js 18+**.

```sh
npm install -g otper-cli
```

To use it programmatically in another Node project (no global install needed):

```sh
npm install otper-cli
```

## Authentication

Otper uses Bearer tokens. Generate a personal access token from your Otper account settings, then:

```sh
otper auth:login
# Otper API token: ********************
# ✓ Authenticated as Sambhav Aggarwal (@sam)
#   saved to /Users/you/.otper-cli/default/config.json
```

You can also pass the token directly:

```sh
otper auth:login --token "238|abc..." --base-url https://otper.com --team ssntpl
```

Or skip the saved config and use environment variables (handy for CI):

```sh
export OTPER_TOKEN="238|abc..."
export OTPER_BASE_URL="https://otper.com"
otper board:search taillog
```

To sign out:

```sh
otper auth:logout
```

### Multiple profiles

Set `OTPER_PROFILE` to maintain isolated config files per environment:

```sh
OTPER_PROFILE=staging otper auth:login --base-url https://staging.otper.com
OTPER_PROFILE=staging otper board:list
```

## Configuration

Credentials are stored at `~/.otper-cli/<profile>/config.json` with mode `0600`. The file looks like:

```json
{
  "baseUrl": "https://otper.com",
  "token": "238|...",
  "team": "ssntpl"
}
```

Resolution order (highest priority first):

1. Command-line flags: `--token`, `--base-url`
2. Environment variables: `OTPER_TOKEN`, `OTPER_BASE_URL`, `OTPER_TEAM`
3. Saved config file

## Command reference

Run `otper <topic> --help` to see commands within a topic, and `otper <topic>:<command> --help` for full flag documentation.

### Auth

| Command | Description |
| --- | --- |
| `otper auth:login [token]` | Save credentials to the active profile. |
| `otper auth:logout` | Remove the saved credentials. |
| `otper auth:whoami` | Show the user the token authenticates as. |

### Board

| Command | Description |
| --- | --- |
| `otper board:list [-q query]` | List boards (alias for search). |
| `otper board:search <query>` | Search boards by name. |
| `otper board:show <id>` | Show a board by ID. Use `--team --slug` to look up by slug. |
| `otper board:create --team-id --name --key --slug` | Create a new board. |

### List

| Command | Description |
| --- | --- |
| `otper list:list --board <id>` | List all lists on a board. |
| `otper list:show <id> [--page --search]` | Show a list with its cards. |
| `otper list:create --board --name` | Create a list. |
| `otper list:rename <id> [--name --description --color]` | Update a list. |
| `otper list:reorder <id> <to-id>` | Reorder a list relative to another. |

### Card

| Command | Description |
| --- | --- |
| `otper card:list --list <id>` | List cards in a list (paginated, 25/page). |
| `otper card:show <id>` | Show a card by ID. Use `--slug` to look up by slug. |
| `otper card:create --list --title` | Create a card. |
| `otper card:update <id> [--title --description --due-date ...]` | Update a card. |
| `otper card:move <id> --to-list <listId> [--over <cardId>]` | Move a card. |
| `otper card:assign <id> --user <userId>` | Assign a user (repeat `--user` for many). |
| `otper card:unassign <id> --user <userId>` | Unassign users. |
| `otper card:label <id> --label <labelId>` | Attach labels. |
| `otper card:unlabel <id> --label <labelId>` | Detach labels. |
| `otper card:comment <id> --text "..."` | Add a comment to a card. |
| `otper card:comments <id>` | List comments on a card (newest first). |
| `otper card:delete <id> [-y]` | Permanently delete a card. |

The `--search` flag on `card:list` and `list:show` accepts the same syntax as the Otper UI:

```sh
otper card:list --list 119 --search "labels:bug;assignee:harsh;status:not completed"
otper card:list --list 119 --search "due date:overdue"
otper card:list --list 119 --search "#TL442"
```

### Label

| Command | Description |
| --- | --- |
| `otper label:list --board <id>` | List labels on a board. |
| `otper label:create --board --name [--color]` | Create a label. |
| `otper label:update <id>` | Update a label. |
| `otper label:delete <id> [-y]` | Delete a label. |

### Comment

| Command | Description |
| --- | --- |
| `otper comment:update <id> --text "..."` | Edit a comment. |
| `otper comment:delete <id> [-y]` | Delete a comment. |
| `otper comment:react <id> --reaction like` | Toggle a reaction (`like`, `love`, `laugh`, `wow`, `sad`, `angry`). |

### Team

| Command | Description |
| --- | --- |
| `otper team:show <id>` | Show a team with members and boards. |
| `otper team:users <id>` | List members of a team. |

### Misc

| Command | Description |
| --- | --- |
| `otper me` | Alias for `auth:whoami`. |
| `otper search <query> [--type boards\|users]` | Search boards (default) or users. |
| `otper priorities [--user <id>]` | Today's priority cards for a user (defaults to you). |

## Output formats

Every command supports `--format`:

| Format | Description |
| --- | --- |
| `default` | Pretty table or vertical key/value (best for humans). |
| `json` | Pretty-printed JSON (best for piping into `jq`). |
| `csv` | RFC-4180 CSV (best for spreadsheets). |
| `silent` | No output, only an exit code (best for scripts). |

```sh
otper card:list --list 119 --format json | jq '.data[].title'
otper board:search team --format csv > boards.csv
otper card:move 1234 --to-list 138 --format silent && echo moved
```

## Library usage

`otper-cli` doubles as a typed library. Useful for openclaw plugins and other Node integrations:

```ts
import { OtperClient, boards, cards, lists } from 'otper-cli';

const client = new OtperClient({
  baseUrl: 'https://otper.com',
  token: process.env.OTPER_TOKEN!,
});

const board = await boards.getBoard(client, '24');
const inProgress = await lists.getListWithCards(client, '119', 1);

for (const card of inProgress!.cards.data) {
  console.log(card.card_number, card.title);
}

await cards.moveCard(client, '36905', '120'); // → Done
```

You can also load the user's saved config:

```ts
import { OtperClient, resolveConfig } from 'otper-cli';

const cfg = resolveConfig();             // throws if not authenticated
const client = OtperClient.fromConfig(cfg);
```

For raw GraphQL escape-hatches:

```ts
const data = await client.gql<{ me: { id: string } }>(
  `query { me { id name } }`,
);
```

## Examples

**Daily standup digest** — list everything in progress and pipe into a summary:

```sh
otper card:list --list 119 --format csv > standup.csv
```

**Move a card to Done in a script:**

```sh
otper card:move "$CARD_ID" --to-list 120 --format silent
```

**React to every unread comment** (using `jq`):

```sh
otper card:comments "$CARD_ID" --format json \
  | jq -r '.[] | select(.reactions == []) | .id' \
  | xargs -I {} otper comment:react {} --reaction like --format silent
```

**Use a different token per command** (no config required):

```sh
OTPER_TOKEN="$BOT_TOKEN" otper card:comment 1234 --text "Build queued"
```

## Contributing

```sh
git clone git@github.com:ssntpl/otper-cli.git
cd otper-cli
npm install
npm run dev -- board:search hello   # run from source via tsx
npm run build                       # compile to dist/
node bin/run.js --help              # run the compiled CLI
```

PRs welcome. Please:

- Add or update the README's command reference for any new commands.
- Keep GraphQL queries colocated in `src/api/<resource>.ts`.
- Mirror the existing `BaseCommand`/`Column`/`output()` pattern when adding commands so `--format` works uniformly.

## License

[MIT](LICENSE) © SSNTPL
