# Moonhem

Real estate listings (React) + FastAPI + PostgreSQL.

## Repository layout

| Path | Purpose |
|------|---------|
| **`backend/`** | Python package **`backend`**: FastAPI app (`app.py`), DB layer, auth, seed scripts. |
| **`web/`** | Vite + React SPA; dev server proxies `/api` → API. |
| **`tests/`** | Pytest suite for the API (`pytest.ini` sets `pythonpath = .`). |
| **`run_api.py`** | Run the API from **repo root** (fixes import path on any cwd). |
| **`docker-compose.yml`** | Local PostgreSQL only. |
| **`.env`** (root) | `DATABASE_NAME`, `PASSWORD`, optional `CORS_ORIGINS`. See `.env.example`. |

Do not run `uvicorn` from inside `backend/`; always use the repo root (see `run_api.py` and `requirements.txt`).

## Quick start

**Database**

```bash
docker compose up -d
cp .env.example .env   # then edit DATABASE_NAME / PASSWORD to match compose
python backend/db_setup.py
python backend/seed.py
```

**API** (from repo root, with venv activated)

```bash
pip install -r requirements.txt
python run_api.py
```

**Web**

```bash
cd web && npm install && npm run dev
```

Open the app at the URL Vite prints (usually `http://localhost:5173`). In development, API calls use `/api` and are proxied to `http://127.0.0.1:8000`.

**Checks:** `http://127.0.0.1:8000/health` and `http://127.0.0.1:8000/health/db`

## Tests

```bash
pytest
```
