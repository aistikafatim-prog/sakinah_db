# Sakinah Backend

Express + MySQL backend scaffold for the frontend.

Quick start:

1. Copy `.env.example` to `.env` and fill values.
2. Install deps:

```bash
cd backend
npm install
```

3. Start dev server:

```bash
npm run dev
```

The server will auto-sync models to the database on start (using Sequelize `sync()`).
