# Architecture Plan

## Target Architecture
Modular monolith with clear separation between HTTP layer, services, stores, and scraper infrastructure. The backend stays a single deployable service but follows clean boundaries to make future extraction straightforward.

## Module Boundaries
- HTTP Layer
  - Express app wiring
  - Route registration
  - Controllers and request validation
- Application Services
  - Search, downloads, files, and health orchestration
- Infrastructure
  - Lucida scraping client
  - Download workflow and streaming
  - In-memory job store
  - File system access
- Shared Utilities
  - Validation
  - Logging
  - HTTP client

## Data Models
- DownloadJob
  - id, url, options, status, progress, message
  - createdAt, updatedAt, startedAt, finishedAt
  - result, error
- SearchResult
  - title, artist, url, cover
- DownloadLibrary
  - artists -> albums -> files

## API Contract
- Search
  - `GET /api/search?q=` returns `{ success, query, total, results }`
- Downloads
  - `POST /api/downloads` returns `{ success, downloadId, data }`
  - `GET /api/downloads` returns `{ success, total, data }`
  - `GET /api/downloads/:id` returns `{ success, data }`
  - `DELETE /api/downloads/cleanup` returns `{ success, cleanedCount }`
- Files
  - `GET /api/files` returns `{ success, total, data }`
- Health
  - `GET /api/health` returns status summary
  - `GET /api/health/ready` and `GET /api/health/live`

## Internal Interfaces
- DownloadService
  - `startDownload({ url, options })`
  - `getById(id)`
  - `list()`
  - `cleanup(maxAgeMs)`
- FilesService
  - `listDownloadsTree()`
- SearchService
  - `search(query)`
- HealthService
  - `getStatus()`

## Diagram

```text
[Nuxt UI]
   |
   v
[HTTP Controllers] -> [Services] -> [Store | Scraper | FS]
                          |              |
                          v              v
                     [Jobs]         [Lucida APIs]
```

## Deployment Notes
- Single API service for scraping + downloads.
- Single Nuxt app serving UI.
- Downloads stored locally under a configurable directory.
