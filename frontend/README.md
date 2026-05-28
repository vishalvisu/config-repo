# Title & Thumbnail Check (Frontend)

Next.js (App Router) dashboard — title aur thumbnail check for Indian YouTube creators.

## Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
```

## Run

```bash
npm run dev
```

Open http://localhost:3000

Ensure the backend is running at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).

## Features

- Two-column responsive layout: form (left) and results (right)
- Drag-and-drop thumbnail upload with preview
- AI-generated thumbnail images when the backend has `OPENAI_API_KEY` set (downloadable grid); otherwise text concept briefs
- Multipart POST to `/api/v1/grader/analyze`
- CTR grade badge, metric bars, title alternatives with copy, 120px mobile simulator
