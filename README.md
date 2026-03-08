# Lucida Music App - Refactored

This repository contains a clean, modular rewrite of the Lucida music workflow. The new implementation lives under `version-2.0/` and preserves the existing API behavior while making the codebase easier to extend.

## What Is Included
- Modular API backend with explicit service and controller layers.
- Nuxt 3 frontend with reusable UI components.
- Legacy endpoint compatibility.
- Updated documentation and setup guides.

## Quick Start
1. Install dependencies.

```bash
cd version-2.0
npm install
```

2. Start the backend API.

```bash
npm run dev:api
```

3. Start the frontend.

```bash
npm run dev:web
```

4. Open the UI at `http://localhost:3001`.

## Environment
Copy `version-2.0/apps/api/.env.example` to `.env` and adjust if needed.

## API Summary
- `GET /api/search?q=`
- `POST /api/downloads`
- `GET /api/downloads`
- `GET /api/downloads/:id`
- `GET /api/files`
- `GET /api/health`

Legacy endpoints are still supported for backward compatibility.
