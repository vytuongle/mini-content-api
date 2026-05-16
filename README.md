# Mini Content API

A versioned content-management REST API built with Node.js, TypeScript, Express, and Prisma — with a lightweight web UI for browsing, editing, and inspecting version history. Every update snapshots the prior state into an append-only history table, so you can retrieve the full edit timeline for any entry.

**Live demo:** https://mini-content-api.onrender.com
**Repo:** https://github.com/vytuongle/mini-content-api

> Free-tier cold start: the first request after ~15 min of inactivity takes ~30 seconds to wake the service.

## Stack

- **Runtime:** Node.js 20 + TypeScript (strict mode)
- **Framework:** Express
- **Database:** SQLite via Prisma ORM
- **Validation:** Zod (schemas at the API edge)
- **Testing:** Vitest + Supertest (8 integration tests covering the full route surface)
- **UI:** Vanilla HTML/CSS/JS served as static assets — no framework, no build step for the frontend
- **Deployment:** Render (auto-deploy on push to `main`)

## API

All routes versioned under `/api/v1/`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness check |
| `GET` | `/api/v1/entries` | List entries (newest first) |
| `GET` | `/api/v1/entries/:id` | Get one entry |
| `POST` | `/api/v1/entries` | Create entry |
| `PUT` | `/api/v1/entries/:id` | Update entry (snapshots prior version) |
| `DELETE` | `/api/v1/entries/:id` | Delete entry and its history |
| `GET` | `/api/v1/entries/:id/versions` | Retrieve version history |

### Example

\`\`\`bash
# Create
curl -X POST https://mini-content-api.onrender.com/api/v1/entries \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Hello","body":"My first entry"}'

# Update (creates version 2; original snapshotted)
curl -X PUT https://mini-content-api.onrender.com/api/v1/entries/<id> \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Hello, again"}'

# Inspect history
curl https://mini-content-api.onrender.com/api/v1/entries/<id>/versions
\`\`\`

## Design notes

- **Versioning via snapshot table.** PUT requests copy the existing row into `EntryVersion` *before* the update, giving append-only history without slowing the primary read path or requiring soft-delete columns on the main table.
- **Validation at the edge.** Zod schemas validate request shapes before any DB call, so invalid input returns a structured 400 with field-level errors instead of leaking ORM exceptions.
- **Versioned routes from day one.** All resource paths live under `/api/v1/`, leaving room to evolve contracts (`v2`) without breaking consumers — cheap up front, expensive later.
- **Health check separate from API.** `/health` is unversioned and stable so platform monitors don't break when the API surface changes.
- **Strict TypeScript end-to-end.** Compiled with `tsc` (not just `tsx`) in CI/deploy so type errors fail the build, not production.
- **No-build UI.** The frontend is plain HTML/CSS/JS served from `public/` — chosen to keep the deploy story simple and the focus on the backend, which is what the project is demonstrating.

## Run locally

\`\`\`bash
npm install
npm run db:push   # create local SQLite + apply schema
npm run dev       # http://localhost:3000
\`\`\`

## Tests

\`\`\`bash
npm test
\`\`\`

Coverage: creation, validation failure paths, listing, retrieval, version snapshotting on update, 404 handling, and deletion.

## Project structure

\`\`\`
src/
  index.ts              # Express app + middleware + static UI serving
  routes/
    entries.ts          # Entry resource routes
  lib/
    prisma.ts           # Prisma client singleton
    validation.ts       # Zod schemas + inferred types
prisma/
  schema.prisma         # Data model: Entry + EntryVersion
public/
  index.html            # Browser UI (create, edit, delete, view history)
tests/
  entries.test.ts       # Integration tests via Supertest
\`\`\`
