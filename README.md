<p align="center"><img src="https://github.com/xdfkenny/LucidaMusicEngine-2.0/blob/main/public/Astrahye%20Veylora.svg?raw=true" width="100%" /></p>

<h1 align="center">Lucida Music Engine 2.0</h1>

<p align="center"><b>Modular Nuxt + Express workstation for Lucida-powered search, download orchestration, queue control, and local music library management.</b></p>

<p align="center"><a href="#overview">Overview</a> • <a href="#quick-start">Quick Start</a> • <a href="#architecture">Architecture</a> • <a href="#documentation">Documentation</a> • <a href="#scripts">Scripts</a> • <a href="#recommended-agent-workflow">Recommended Agent Workflow</a> • <a href="#folder-structure">Folder Structure</a> • <a href="#current-reality--caveats">Current Reality / Caveats</a></p>

---

## Overview

This repository is the **new generation rewrite** of the original Lucida stack and should be treated as the active codebase. It is the successor to [LucidaMusicEngine](https://github.com/xdfkenny/LucidaMusicEngine), with a clearer monorepo structure and modular backend/frontend boundaries.

| Surface | Route | Description | Data Source |
| --- | --- | --- | --- |
| Home Workspace | `/home` | Operational snapshot: active jobs, library totals, latest job telemetry. | `GET /api/downloads`, `GET /api/files` |
| Search Workspace | `/` | Search Lucida-compatible sources and queue downloads from results. | `GET /api/search`, `GET /api/search/baka` |
| Downloads Workspace | `/downloads` | Manage queue jobs (pause/resume/retry/cancel) and browse downloaded library files. | `GET/POST /api/downloads`, `POST /api/downloads/:id/*`, `GET /api/files` |
| Console Workspace | `/console` | Real-time backend event stream for API, scraper, queue, and system diagnostics. | `GET /api/console/stream` |
| Library Workspace | `/library` and `/library/[artist]/[album]` | Structured artist/album browsing with album-level detail. | `GET /api/files`, `GET /api/files/album`, `GET /api/files/cover` |
| API Search Surface | `/api/search` (legacy: `/search`) | Query validation, Lucida scraping, normalized result payloads. | Lucida web/API endpoints via scraper modules |
| API Download Surface | `/api/downloads` (legacy: `/lucidadw`) | Queue creation and lifecycle controls for download jobs. | In-memory `DownloadStore` + downloader pipeline |
| API Health Surface | `/api/health`, `/api/health/ready`, `/api/health/live` | Liveness/readiness/runtime checks and downloads directory status. | Process metrics + filesystem checks |

## Quick Start

```bash
# install dependencies from repo root
npm install

# run API + web together (PowerShell helper)
npm run dev

# run services separately
npm run dev:api
npm run dev:web

# production build for both workspaces
npm run build
```

## Architecture

- **Monorepo**: npm workspaces (`apps/api`, `apps/web`)
- **Backend**: Node.js + Express (ES modules), CORS, dotenv, pino logging
- **Frontend**: Nuxt 3 + Vue 3 + Pinia + Tailwind CSS
- **Scraping/Download layer**: Lucida client/parser/downloader modules
- **Storage model**: **in-memory** job tracking + local filesystem downloads tree
- **Compatibility**: Legacy endpoints kept active (`/search`, `/lucidadw`, `/status/:downloadId`, `/downloads`)

<p align="center"><img src="public\image.png" width="100%" /></p>

## Documentation

> Read these in order when onboarding a new maintainer.

### Core Docs

1. [README.md](README.md)
2. [AI-Instructiuons/SETUP.md](AI-Instructiuons/SETUP.md)
3. [AI-Instructiuons/ARCHITECTURE.md](AI-Instructiuons/ARCHITECTURE.md)
4. [AI-Instructiuons/PROJECT_ANALYSIS.md](AI-Instructiuons/PROJECT_ANALYSIS.md)
5. [AI-Instructiuons/DEVELOPER_GUIDE.md](AI-Instructiuons/DEVELOPER_GUIDE.md)

### Specialized Docs

- [AI-Instructiuons/SYSTEM_DESIGN.md](AI-Instructiuons/SYSTEM_DESIGN.md) for workflow boundaries and system intent.
- [AI-Instructiuons/WORKSTATION_BLUEPRINT.md](AI-Instructiuons/WORKSTATION_BLUEPRINT.md) for UI shell, staged modules, and roadmap.
- [AI-Instructiuons/ARCHITECTURE_PLAN.md](AI-Instructiuons/ARCHITECTURE_PLAN.md) for module contracts and internal service interfaces.
- [AI-Instructiuons/REFACTOR_PLAN.md](AI-Instructiuons/REFACTOR_PLAN.md) for migration and refactor rationale.
- [README_DEV.md](README_DEV.md) for local debugging notes, Cloudflare mitigation, and FFmpeg requirements.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Runs root PowerShell workflow (`dev.ps1`) to boot development environment. |
| `npm run dev:api` | Starts API workspace (`@lucida/api`) in development mode. |
| `npm run dev:web` | Starts Nuxt workspace (`@lucida/web`) on port `3001`. |
| `npm run build` | Builds API workspace (no-op build step) and Nuxt production build. |
| `npm run start` | Starts API workspace in production-style mode. |
| `npm run dev -w @lucida/api` | Direct API dev run from workspace script. |
| `npm run dev -w @lucida/web` | Direct web dev run from workspace script. |

## Recommended Agent Workflow

1. Sync dependencies and baseline startup: `npm install` then `npm run dev`.
2. If isolating services, run split terminals: `npm run dev:api` and `npm run dev:web`.
3. Validate API contracts before edits: `GET /api/search?q=...`, `POST /api/downloads`, `GET /api/downloads/:id`, `GET /api/files`, `GET /api/health`.
4. Preserve backward compatibility when touching routes: keep `/search`, `/lucidadw`, `/status/:downloadId`, and `/downloads` behavior intact.
5. For scraper issues (especially Cloudflare challenge responses), follow `README_DEV.md` paths (headers tuning, FlareSolverr, or Playwright client variants).
6. After changes, re-check console streaming and queue controls from `/console` and `/downloads` to confirm end-to-end runtime behavior.

## Folder Structure

```text
music-app-lucida-2.0/
├── apps/
│   ├── api/                     # Express API workspace
│   │   ├── src/
│   │   │   ├── config/          # Env/runtime configuration
│   │   │   ├── lib/             # Shared logger + HTTP client utilities
│   │   │   ├── middleware/      # Error and not-found handlers
│   │   │   ├── modules/         # Feature modules (search, downloads, files, health, console, metadata)
│   │   │   ├── scraper/         # Lucida client/parser/downloader implementations
│   │   │   ├── utils/           # Validators + metadata helpers
│   │   │   └── server.js        # API bootstrap and route mounting
│   │   └── package.json         # API scripts and dependencies
│   └── web/                     # Nuxt workstation workspace
│       ├── assets/              # Global styling assets
│       ├── components/          # Reusable UI components
│       ├── composables/         # API composables and client helpers
│       ├── layouts/             # App shell layouts
│       ├── pages/               # Route-based product surfaces
│       ├── stores/              # Pinia state stores
│       ├── types/               # Shared TS interfaces
│       ├── nuxt.config.ts       # Nuxt/runtime config
│       └── package.json         # Web scripts and dependencies
├── AI-Instructiuons/            # Project architecture/setup/plan docs
├── public/                      # Static public assets (banner/logo candidates)
├── downloads/                   # Local downloaded output (runtime data)
├── download web/                # Additional local workspace asset directory
├── dev.ps1                      # Windows dev bootstrap script
├── package.json                 # Root workspace scripts
├── README.md                    # Main repository documentation
└── README_DEV.md                # Local dev/debug operational notes
```

## Current Reality / Caveats

<details>
<summary>Operational caveats and implementation constraints</summary>

- **This repository is the active successor to the original project at [LucidaMusicEngine](https://github.com/xdfkenny/LucidaMusicEngine).**
- **No automated tests are present** in the current codebase.
- **No explicit lint script is defined** in root or workspace `package.json` scripts.
- Download job state is **in-memory only**; process restarts clear queue/status history.
- Scraping reliability depends on Lucida upstream HTML/API behavior and can break with structural changes.
- Cloudflare mitigation may be required; `README_DEV.md` documents FlareSolverr and Playwright fallback patterns.
- FFmpeg availability in PATH is required for some media/cover workflows.
- `globalThis.fetch` must exist at runtime (Node 18+ expected), otherwise downstream features may fail.
- Legacy compatibility endpoints are intentionally still mounted and should not be removed casually.

</details>

<p align="center"><sub>Lucida Music Engine 2.0 documentation baseline. New repo lineage: <a href="https://github.com/xdfkenny/LucidaMusicEngine">LucidaMusicEngine</a> → this modular rewrite.</sub></p>
