# Watchdog

Watchdog is split into separate frontend and backend apps:

- `frontend/`: Next.js app
- `backend/`: FastAPI app

## Frontend

Run the frontend from the repo root:

```bash
npm run dev
```

Or directly:

```bash
cd frontend
npm run dev
```

## Backend

Run the backend from `backend/`:

```bash
.\.venv\Scripts\uvicorn.exe app.main:app --reload
```
