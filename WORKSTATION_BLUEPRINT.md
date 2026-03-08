# Music Acquisition Workstation Blueprint

## 1) High Level Architecture Design
The system stays a modular monolith with a clean boundary between API and UI while adding workstation-grade UI layers.

Key layers
- UI Shell: Sidebar navigation, workspace layout, and global design tokens.
- Feature Workspaces: Search, Downloads, Library, and future modules (Playlists, Analytics, Settings).
- Service Facade: `useApi` remains the compatibility surface for existing endpoints.
- Orchestration: Download queue still backed by the API job store and existing scraper logic.
- Metadata Enrichment (UI Ready): UI panels and hooks prepared for external metadata sources without changing backend behavior.

Compatibility guarantees
- Existing API contracts remain unchanged.
- Scraper and download orchestration stay untouched.
- UI refactor only re-wires presentation and component structure.

## 2) Updated Folder Structure
```
apps/
  api/
  web/
    assets/
      css/
        main.css
    components/
      DownloadProfiles.vue
      JobInspector.vue
      LibraryExplorer.vue
      MetadataPanel.vue
      QueueItem.vue
      QueuePipeline.vue
      ResultCard.vue
      SearchBar.vue
      WorkspaceHeader.vue
    layouts/
      default.vue
    pages/
      analytics.vue
      downloads.vue
      home.vue
      index.vue
      library.vue
      playlists.vue
      settings.vue
    composables/
    types/
```

## 3) Design System Specification
Color palette
- Primary background: `#0A0F18`
- Surface panels: `#121826`
- Primary accent: `#4F7CFF`
- Secondary accent: `#67E8F9`
- Highlight glow: `#C7D2FE`

Typography
- Titles: `Cinzel` (serif, uppercase spacing)
- Body/UI: `Manrope` (clean, readable sans)

UI primitives
- Panels use `--shadow` and glass blur for cinematic depth.
- Cards use subtle hover lift and accent borders.
- Status badges and pipeline steps use uppercase, letter-spaced labels for clarity.

## 4) UI Component List
Core modules
- `WorkspaceHeader` for consistent page titles and actions.
- `SearchBar` for acquisition entry.
- `ResultCard` for search results.
- `DownloadProfiles` for smart profile selection.
- `QueuePipeline` for stage visualization.
- `QueueItem` for per-job management.
- `JobInspector` for deep job context.
- `MetadataPanel` for enrichment readiness.
- `LibraryExplorer` for artist/album/track hierarchy.

## 5) Refactored Application Structure
Workspace layout
- Sidebar + main stage replaces the old dashboard layout.
- Home provides telemetry and quick status.
- Search handles acquisition, queue start, and metadata preview.
- Downloads becomes the queue manager plus inspector.
- Library isolates the organized archive view.
- Playlists, Analytics, Settings are staged for future work.

## 6) Example Implementation Of Key Components
- `apps/web/components/QueuePipeline.vue`
- `apps/web/components/JobInspector.vue`
- `apps/web/components/DownloadProfiles.vue`
- `apps/web/layouts/default.vue`
- `apps/web/pages/index.vue`

## 7) Feature Roadmap
Phase 1
- Job pause/resume/retry/cancel API support.
- Persisted queue storage (Redis or DB).
- Metadata enrichment service (MusicBrainz, LastFM, Spotify).

Phase 2
- Artist Explorer with discography sync and related artists.
- Smart playlists (auto-tagging and rules).
- Playback preview pipeline.

Phase 3
- Multi-user auth, workspace roles, and audit logs.
- Analytics dashboards for throughput and storage.
- Multi-source acquisition with per-source routing rules.
