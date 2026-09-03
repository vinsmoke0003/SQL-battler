# SQL Battle

Multiplayer SQL practice for friends: create a private room, share a code, and race to solve
SQL challenges against the same prebuilt database in real time. Solo practice uses the same
question bank.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 (set PORT to override)
```

Production:

```bash
npm run build
npm start
```

`npm run dev` starts `server.ts`, a custom Next.js server that also hosts the Socket.IO room
engine. Rooms live in memory in that process — a restart clears them.

## How it works

| Layer | Where | Notes |
| --- | --- | --- |
| Datasets | `lib/datasets/` | Company, E-Commerce, University as SQLite seed SQL. Schema and sample rows are introspected at runtime. |
| Sandbox | `lib/sql-runner/` | sql.js (SQLite in WASM), one in-memory DB per dataset, opened `query_only`. `guard.ts` allows a single `SELECT`/`WITH` statement, blocks DDL/DML, caps length, rows (500) and execution time (2s). |
| Questions | `lib/questions/` | 94 authored questions (36 easy / 36 medium / 22 hard) with a reference solution each. Expected output is produced by running the solution once, so authoring a question is just writing the SQL. |
| Validation | `lib/validation/compare.ts` | Compares result sets, not SQL text: column names (case-insensitive), numeric tolerance, NULLs, and row order only when the question says it matters. Feedback explains what differs. |
| Scoring | `lib/scoring/scoring.ts` | 10/20/30 base, speed bonus (+5/+3/+1), first-try +3, streak bonuses at 3/5/10, hint penalties, optional −2 per wrong submission. |
| Selection | `lib/questions/select.ts` | Unseen questions first; when a level is exhausted it recycles, prioritising failed, then slow, then least-recent. Mixed mode ramps 40/40/20. |
| Rooms | `lib/rooms/store.ts`, `server.ts` | Lobby → live → finished. Host controls (start, kick, end, rematch), reconnect by player id, timer sync via server clock, first-solver and streak events. |
| UI | `app/`, `components/` | `/`, `/create`, `/join`, `/room/[code]`, `/battle/[code]`, `/results/[code]`, `/practice`. Monaco editor with schema-aware autocomplete; ⌘/Ctrl+Enter runs, ⌘/Ctrl+Shift+Enter submits. |

Identity is a nickname plus a random id in `localStorage` — no accounts. Practice history and
"practice my mistakes" also live in `localStorage`.

## Scripts

```bash
npm run test:questions   # runs every reference solution and self-validates it
npm run lint             # tsc --noEmit
npx tsx scripts/bot-player.ts http://localhost:3000 ROOMCODE Rahul   # simulated opponent for testing
```

## Adding questions

Add an entry to `lib/questions/easy.ts`, `medium.ts` or `hard.ts` with a `solution` that
aliases its columns to the names you want players to produce, set `orderMatters` when the
prompt specifies an order, and run `npm run test:questions`.
