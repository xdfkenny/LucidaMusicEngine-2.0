# Refactor Plan

## Structural Changes
- Create `version-2.0/` as a clean, modular implementation.
- Separate API concerns into controllers, routes, services, store, and scraper layers.
- Centralize API wiring in `create-app.js` with a single `main.js` entry point.
- Split UI into reusable components for search results, job status, job list, and library view.

## Code Improvements
- Normalize download option handling in a single service entry point.
- Keep validation logic centralized and reused by controllers.
- Replace cross-module imports with clean service boundaries.
- Keep data shapes consistent between endpoints and UI types.

## Performance Improvements
- Avoid extra file system reads in controllers by funneling through services.
- Keep long-running download work off the request path.
- Maintain backpressure through streaming and temporary files.

## Developer Experience
- Clear folder structure and entry points.
- Nuxt UI uses typed composable and shared interfaces.
- Documentation for setup and architecture included.

## Execution Roadmap
1. Analyze current API and UI behavior to preserve contracts.
2. Extract shared services, store, and scraper into clean modules.
3. Rewire HTTP routes and legacy compatibility endpoints.
4. Modularize UI with reusable components.
5. Document architecture, setup, and developer workflow.
