# Music Marketplace (FastAPI + React)

Small hiring-exercise app: admins manage artists/albums; users browse, purchase, rate owned albums, and view their library.

## Stack
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT auth (access + refresh)
- Frontend: React (Vite) + React Query
- DB: PostgreSQL in Docker Compose (primary). (SQLite can be added later if desired.)

## Quickstart (Docker)
1. Install Docker Desktop.
2. From repo root:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000` (OpenAPI at `/docs`)

## Seeded credentials
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

## Local dev (without Docker)
### Backend
```bash
cd backend
python -m venv .venv
./.venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Notes / decisions (high level)
- Business rules are enforced server-side (purchase once, rate only owned, one rating per user/album).
- Album rating is computed from `ratings` (average) and exposed on album responses.
- Auth is JWT-based with short-lived access tokens + refresh flow.

