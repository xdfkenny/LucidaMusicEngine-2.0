# System Design

## Core Intent
The system provides a simple workflow for finding music on Lucida/Tidal, starting downloads, and browsing completed files. It abstracts Lucida scraping and stream handoff behind a stable API and a lightweight UI.

## Core Workflows
- Search: Accept a query, scrape Lucida search results, return normalized track cards.
- Download: Accept a track or album URL, resolve metadata, request handoff tokens, poll for readiness, then stream audio to disk.
- Monitor: Track download progress and expose job status in real time.
- Library: Enumerate downloaded files grouped by artist and album.

## User Interactions
- Enter a search query and view results.
- Select a track or album and configure download options.
- Observe progress updates while the download runs.
- Review previous jobs and inspect downloaded files.

## Data Lifecycle
- Search results are ephemeral and returned per request.
- Download jobs are stored in memory for the lifetime of the API process.
- Audio files and cover art are persisted under the downloads directory.

## System Responsibilities
- Provide predictable API contracts for search, download, and status.
- Encapsulate scraping logic and handoff polling inside the backend.
- Maintain forward compatibility for legacy endpoints.
- Keep the UI focused on orchestration and visibility, not scraping or file I/O.
