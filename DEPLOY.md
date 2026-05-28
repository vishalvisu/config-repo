# Deploy: Vercel (frontend) + Render (backend)

Code on GitHub is required. After pushing deployment changes, follow these steps.

## 1. Render (FastAPI backend)

### Option A — Dashboard

1. [render.com](https://render.com) → **New** → **Web Service** → connect GitHub repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
3. **Environment** (add secrets in the dashboard, not in git):

   | Variable | Example |
   |----------|---------|
   | `CORS_ORIGINS` | `https://your-app.vercel.app,http://localhost:3000` |
   | `GROQ_API_KEY` | (optional) |
   | `OPENAI_API_KEY` | (optional) |

4. Deploy. Note the URL, e.g. `https://config-repo-api.onrender.com`.
5. Verify: `https://<render-url>/health` → `{"status":"ok"}`

### Option B — Blueprint

1. **New** → **Blueprint** → select repo → use [`render.yaml`](render.yaml).
2. Set `CORS_ORIGINS`, `GROQ_API_KEY`, `OPENAI_API_KEY` when prompted.

**Free tier:** service sleeps after ~15 min idle; first request may be slow (cold start).

---

## 2. Vercel (Next.js frontend)

1. [vercel.com](https://vercel.com) → **Add New Project** → import GitHub repo.
2. **Root Directory:** `frontend`
3. **Environment variable** (all environments):

   | Key | Value |
   |-----|--------|
   | `NEXT_PUBLIC_API_URL` | `https://<your-render-service>.onrender.com` (no trailing slash) |

4. Deploy. Note the URL, e.g. `https://config-repo-v2.vercel.app`.

---

## 3. Sync CORS

1. Render → **Environment** → set `CORS_ORIGINS` to your exact Vercel URL (and `http://localhost:3000` if needed).
2. Redeploy the backend if it was deployed before Vercel existed.

---

## 4. Smoke test

1. Open the Vercel URL.
2. Submit the grader form with a small `.jpg` thumbnail.
3. DevTools → Network: `POST` to `https://<render>/api/v1/grader/analyze` should return **200**.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error | `CORS_ORIGINS` must match the browser origin exactly; redeploy backend. |
| Frontend calls localhost | Set `NEXT_PUBLIC_API_URL` on Vercel and **redeploy** (baked at build time). |
| Slow first request | Render free cold start; retry. |
