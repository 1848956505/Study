# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Run all backend tests
npm test
# or: npm run test:api

# Start backend API (dev, port 3001+)
npm run dev:api

# Start frontend web UI (dev, port 3000+)
npm run dev:web

# Start both together
npm run dev:all

# Build Milkdown editor bundle (runs automatically before dev:web)
npm run build:editor-bundle -w @study-accelerator/web
```

Tests use a custom runner (`node apps/api/test/run-tests.js`) with `node:assert/strict` — no Jest/Mocha. All tests run sequentially in a single process.

## Project Structure

```
Study/
├── apps/
│   ├── api/        # Backend API — plain Node.js HTTP server
│   └── web/        # Frontend SPA — vanilla JS, JSX components, Milkdown editor
├── packages/
│   └── shared/     # Shared types/constants (placeholder)
├── prisma/         # Prisma schema (PostgreSQL target, not yet active)
├── docs/           # Chinese project documentation
├── scripts/        # Dev tooling (port management, Milkdown build)
├── storage/        # Runtime data (uploads, exports, dev port registry)
└── storage/data/   # Local-first JSON persistence
```

## Architecture

### Backend (`apps/api`)

A plain Node.js HTTP server with a **DDD-inspired** modular layering:

- **`src/server.js`** — Creates the HTTP server with route handling (manual path matching, no router library)
- **`src/app.factory.js`** — Dependency wiring: creates data store, repositories, modules, and HTTP handlers
- **`src/modules/knowledge/`** — The knowledge module:
  - `domain/` — Plain objects: `knowledge-space.js`, `folder.js`, `tag.js`, `note.js`
  - `application/` — Service layer: `note-service.js`, `folder-service.js`, `tag-service.js`, `knowledge-space-service.js`, `search-service.js`, DTOs
  - `infrastructure/` — In-memory repositories (`note-repository.js`, `folder-repository.js`, `tag-repository.js`, `knowledge-space-repository.js`)
  - `http/` — HTTP handler wrappers
- **`src/infrastructure/`** — Cross-cutting: `file-data-store.js` (JSON persistence), `local-attachment-store.js`
- **`src/presentation/`** — Markdown preview rendering

Key pattern: Repositories are in-memory arrays backed by a JSON file. On every mutation they call `dataStore.flush()` to persist. This means the data layer is simple but the Prisma schema shows the intended migration path.

### Frontend (`apps/web`)

A vanilla JavaScript SPA (no framework), served via a plain Node.js HTTP server:

- **`src/main.js`** — Entry point; serves HTML with embedded workspace shell, proxies `/api/` calls to the backend
- **`src/client.js`** — Main client app (~5300 lines): all state management, DOM rendering, event handling, and API calls in one file
- **`src/styles.css`** — Global stylesheet (~4000+ lines)
- **`components/`** — JSX components compiled by esbuild (React-style, used for isolated widget demos)
- **`lib/`** — Utility modules:
  - `editor/` — Milkdown editor integration, tab workspace, file menu, panel state, shortcuts, find/replace
  - `tree-workspace.js` — Folder/note tree operations (insert, delete, move, rename, flatten)
  - `tree-name-validation.js` — Sibling name conflict validation
  - `markdown.js` — Markdown parsing/preview (client-side)
  - `workspace-loading.js` — Initial data loading with cache fallback and recovery
  - `mock-knowledge-base.js` — Seed data for local-only demo mode

State model: A single global `state` object holds all app state. DOM is re-rendered from state via imperative `render*()` functions — no reactive framework.

Data flow: Workspace loads data in priority order: SSR snapshot → localStorage cache → API fetch → mock fallback.

### Testing

Both apps use a custom test runner pattern (no framework):

```js
import assert from 'node:assert/strict';

function runTest(name, callback) {
  try {
    callback();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}
```

Test files export arrays of `{ name, run }` objects, registered in `test/run-tests.js`. Each test file is a self-contained module.

## Data Flow

1. **API start** → `main.js` creates `createPersistentAppContext()` → reads `storage/data/knowledge-base.json`
2. **Request arrives** → `server.js` route handler → calls HTTP handler → calls service → calls repository → returns JSON
3. **Repository mutation** → calls `dataStore.flush()` to write JSON to disk
4. **Frontend loads** → SSR snapshot injected, then API fetches → merges with localStorage cache → renders

## Key Conventions

- **Chinese-first**: UI labels, docs, commit messages are in Chinese. Code identifiers use English.
- **Local-first**: Default storage mode is `local-first` (JSON files). Prisma/PostgreSQL migration is planned.
- **Multi-module workspace**: Only the `知识库` (knowledge) module is active. Other modules (paper, AI, tasks, review) are placeholder icon entries.
- **API response format**: `{ data: ... }` for success, `{ error: "..." }` for failures — simple, consistent.
- **No router library**: API routes match via manual `request.method` + `url.pathname` checks.

## Language

- 默认使用简体中文与我沟通。
-  代码、命令、文件名、目录名、变量名、函数名、接口名保持英文。
