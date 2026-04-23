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

## Deployment

Recommended production split:

- `frontend/` on Vercel
- `backend/` on Render

Alternative production split:

- `frontend/` on Vercel
- `backend/` on Vercel
- external scheduler such as `cron-job.org`

### Render backend

This repo now includes a root [render.yaml](/c:/Users/pchun/Workspace/watch-dog/render.yaml) blueprint that defines:

- a FastAPI web service
- an hourly cron job that runs `python run_checks.py`

Required Render environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CORS_ORIGINS`
- optional `CORS_ORIGIN_REGEX` for preview domains

`CORS_ORIGINS` accepts a comma-separated list of allowed frontend origins. For a Vercel production frontend, set it to your deployed frontend URL.

### Vercel backend

Deploy the `backend/` directory as its own Vercel project.

- Root Directory: `backend`
- No custom build command required
- Python entrypoint: [backend/api/index.py](/c:/Users/pchun/Workspace/watch-dog/backend/api/index.py)

Required Vercel environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CORS_ORIGINS`
- `CRON_SECRET`
- optional `CORS_ORIGIN_REGEX`

The Vercel backend includes an internal trigger endpoint:

- `GET` or `POST` `/internal/run-checks`

Protect it with either:

- `Authorization: Bearer <CRON_SECRET>`
- `X-Cron-Secret: <CRON_SECRET>`

For `cron-job.org`, point the job at the deployed backend URL plus `/internal/run-checks` and send one of the supported secret headers.
