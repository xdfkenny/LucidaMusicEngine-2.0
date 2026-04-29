# Project Analysis

## Purpose
Lucida Music App is a two-part system that lets users search Lucida/Tidal listings, start download jobs, and monitor results through a web UI.

## Architecture Style
Current repository is a small monorepo with two apps and a thin shared boundary through HTTP APIs.

- Backend: Node.js + Express API with modular feature folders.
- Frontend: Nuxt 3 (Vue 3) single-page app that consumes the API.

## Main Components
- `apps/api`: REST API, scraper client, download orchestration, file library browsing.
- `apps/web`: Nuxt UI for search, download options, job monitoring, and library view.

## Module Dependencies
API modules depend on:
- `LucidaClient` for HTML fetch and API handoff requests.
- `LucidaDownloader` for orchestrated download + file writes.
- `DownloadStore` for in-memory job tracking.
- `FilesService` for walking local downloads.

Web modules depend on:
- `useApi` composable for API requests.
- Page-level state for job tracking and polling.

## Data Flow
1. UI calls `GET /api/search?q=...`.
2. API scrapes Lucida search HTML and returns track results.
3. UI posts `POST /api/downloads` with URL + options.
4. API creates a job in memory and launches the downloader asynchronously.
5. UI polls `GET /api/downloads/:id` until completion or error.
6. UI reads library from `GET /api/files`.

## External Services
- Lucida website and Lucida handoff API endpoints for search and download streams.

## API Endpoints
Modern endpoints:
- `GET /api/search?q=`
- `POST /api/downloads`
- `GET /api/downloads`
- `GET /api/downloads/:downloadId`
- `DELETE /api/downloads/cleanup?olderThan=`
- `GET /api/files`
- `GET /api/health`
- `GET /api/health/ready`
- `GET /api/health/live`

Legacy compatibility endpoints:
- `GET /search`
- `POST /lucidadw`
- `GET /status/:downloadId`
- `GET /downloads`

## Build Tools and Configuration
- Workspaces managed by npm.
- Backend runs directly with Node.js.
- Frontend uses Nuxt build and dev server.
- Environment variables are loaded via `.env` in `apps/api`.

## Testing Setup
- No automated tests are present.

## Observed Issues and Risks
- In-memory job store does not persist across restarts.
- Download operations run in-process and can block resources under load.
- No authentication or rate limiting.
- Scraping depends on Lucida DOM stability.
- Error handling is centralized but lacks structured error types.
