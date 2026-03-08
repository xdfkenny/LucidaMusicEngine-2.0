# Setup

## Requirements
- Node.js 18 or newer.
- npm 9 or newer.

## Install
1. Move into the refactored implementation.

```bash
cd version-2.0
```

2. Install dependencies.

```bash
npm install
```

## Configure
1. Copy the API env file.

```bash
copy apps\api\.env.example apps\api\.env
```

2. Adjust values if needed.

## Run
1. Start the API.

```bash
npm run dev:api
```

2. Start the web app in another terminal.

```bash
npm run dev:web
```

3. Open `http://localhost:3001`.
