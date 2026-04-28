# Music Marketplace (FastAPI + React)

Small hiring-exercise app: admins manage artists/albums; users browse, purchase, rate owned albums, and view their library.

## Stack
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT auth (access + refresh)
- Frontend: React (Vite) + React Query + Tailwind CSS
- DB: PostgreSQL (Docker Compose in dev; production typically managed Postgres)

## CI/CD (GitHub Actions → VPS)
This repo includes:
- `.github/workflows/ci.yml`: runs backend tests + frontend build on pushes/PRs to `main`
- `.github/workflows/deploy.yml`: **manual** SSH deploy (git pull + `docker compose` build) — use if you are *not* using GHCR images
- `.github/workflows/build-and-deploy-ghcr.yml`: builds/pushes images to GHCR, then SSH deploys the VPS by pulling images

### GitHub Secrets (repository)
Configure these in **GitHub → Settings → Secrets and variables → Actions**:
- `HOST`: server hostname/IP
- `USER`: SSH user
- `SSH_KEY`: private key (PEM) with access to the server
- `PORT`: SSH port (set to `22` if standard)
- `APP_DIR`: absolute path to the deployed repo on the server (example: `/opt/music-marketplace`)
- `PROD_VITE_API_BASE_URL` (optional): public API base URL used at **frontend image build** time (e.g. `https://music-api.sagambasystem.rw`). If omitted, the build falls back to `http://localhost:8000` (dev default).
- `GHCR_PULL_TOKEN` (usually required): a GitHub **PAT** with `read:packages` used on the VPS to `docker pull` private GHCR images. (Alternative: make the GHCR package public, then you can remove the token + `docker login` step from the workflow.)

### VPS one-time setup (typical)
On the server:
- Install **Docker** + **Docker Compose plugin**
- `git clone` this repo into `VPS_APP_DIR`
- Create a server-side env file at `VPS_APP_DIR/.env.production` containing exports for:
  - `JWT_SECRET`
  - Postgres credentials / connection values used by `docker-compose.yml`
  - `VITE_API_BASE_URL` (public API URL; Vite bakes this in at **build** time)

The deploy workflow runs `docker compose up -d --build` after `git pull`.

## Production compose
For a shared VPS with other apps, use `docker-compose.prod.yml` (unique ports by default):
- Backend: host `18000` → container `8000`
- Frontend: host `15173` → container `5173`

Your existing Caddy on the VPS can reverse-proxy to these host ports.

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
  
These are seeded on first startup for demo/review, and are **not shown in the UI**.

## Local dev (without Docker)
### Backend
```bash
cd backend
python -m venv .venv
./.venv/Scripts/activate
pip install -r requirements.txt
# Optional: override DB URL for local Postgres/SaaS Postgres
# set DATABASE_URL=postgresql+psycopg://USER:PASS@HOST:5432/DBNAME
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

