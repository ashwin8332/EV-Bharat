# EVBharat Backend

Simple auth API for login and signup using SQLite.

## Setup

1. Configure environment variables:

```bash
cp .env.example .env
```

2. Install dependencies and start the API:

```bash
npm install
npm run dev
```

The database file will be created automatically at the path in `DB_PATH`.

## Endpoints

- POST `/api/auth/signup`
- POST `/api/auth/login`
- GET `/api/health`
