# Developer Guide

## Conventions
- Keep HTTP logic in controllers and routing files.
- Keep business logic in services.
- Keep data access and storage in `store/` or `scraper/`.
- Prefer small modules with a single responsibility.

## Adding API Features
1. Add a service method under `apps/api/src/services/`.
2. Add a controller and route under `apps/api/src/app/`.
3. Register the route in `app/routes/api-routes.js`.
4. Update UI types and composables if needed.

## Adding UI Features
1. Add a component under `apps/web/components/`.
2. Wire it into a page under `apps/web/pages/`.
3. Extend `useApi` if new endpoints are required.

## Common Scripts
From `version-2.0/`:
- `npm run dev:api`
- `npm run dev:web`
- `npm run build`

## Environment
- Backend settings live in `apps/api/.env`.
- Frontend base URL uses `NUXT_PUBLIC_API_BASE`.
