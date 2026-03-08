# Architecture

## Overview
The system is a modular monolith with two deployable apps:
- API service for scraping, download orchestration, and file browsing.
- Nuxt UI for search, job monitoring, and library display.

## Backend Layout
`version-2.0/apps/api/src`
- `app/` HTTP wiring, routes, and controllers.
- `services/` application logic.
- `store/` in-memory job storage.
- `scraper/` Lucida client, parser, and downloader.
- `config/` environment settings.
- `lib/` shared HTTP client and logger.
- `middleware/` error and not-found handlers.
- `utils/` validation helpers.

## Frontend Layout
`version-2.0/apps/web`
- `pages/` Nuxt routes for search and downloads.
- `components/` reusable cards and lists.
- `composables/` API access layer.
- `types/` shared UI interfaces.
- `assets/` styling.

## Data Flow
1. UI triggers search through `/api/search`.
2. API scrapes results from Lucida and responds with normalized items.
3. UI queues downloads through `/api/downloads`.
4. API runs the download pipeline and tracks job status.
5. UI polls job status and lists downloaded files from `/api/files`.

## Extensibility
- Replace the job store with Redis or a database.
- Move download execution to a worker process.
- Add authentication and per-user isolation.
- Add rate limiting and retry logic for scraper requests.
