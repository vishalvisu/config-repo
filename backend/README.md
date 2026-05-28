# CoreAI Backend

FastAPI service for the Hinglish Hook & Thumbnail Visual Grader.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set GROQ_API_KEY (get one from https://console.groq.com/)
```

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated browser origins allowed to call the API (set your Vercel URL in production). |
| `GROQ_API_KEY` | No | — | Enables AI title optimization via Groq. If unset, template titles are used. |
| `GROQ_BASE_URL` | No | `https://api.groq.com/openai/v1` | Groq OpenAI-compatible API base URL |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Chat model for title suggestions |
| `GROQ_VISION_MODEL` | No | `meta-llama/llama-4-scout-17b-16e-instruct` | Vision model for thumbnail concept recommendations |
| `GROQ_TIMEOUT_SECONDS` | No | `30` | Request timeout in seconds |
| `OPENAI_API_KEY` | No | — | Enables AI-generated thumbnail images via OpenAI. If unset, text concepts only. |
| `OPENAI_IMAGE_MODEL` | No | `gpt-image-1` | Image model (`gpt-image-1` or `dall-e-3`) |
| `OPENAI_IMAGE_SIZE` | No | `1536x1024` | Output size (16:9 for gpt-image-1 / DALL-E 3) |
| `THUMBNAIL_GEN_COUNT` | No | `1` | Number of thumbnail concepts and images generated per analyze |
| `OPENAI_TIMEOUT_SECONDS` | No | `120` | OpenAI image request timeout |

Restart uvicorn after changing `.env`. Never commit `.env` or API keys to git. Rotate keys immediately if they are exposed.

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

## Analyze endpoint

`POST /api/v1/grader/analyze` — `multipart/form-data`

| Field       | Type   |
|-------------|--------|
| title       | string |
| niche       | Tech, Gaming, Finance, Vlogs, Comedy, Infotainment |
| language    | English, Hinglish, Pure Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati, Punjabi, Odia, Other Regional |
| thumbnail   | .png or .jpg image file |
| video_context | optional string, max 500 chars — brief summary for Groq title optimization |

### Example (curl)

```bash
curl -X POST http://localhost:8000/api/v1/grader/analyze \
  -F "title=My Video Title Draft" \
  -F "niche=Tech" \
  -F "language=Hinglish" \
  -F "thumbnail=@/path/to/thumb.jpg"
```

CORS allowed origins come from `CORS_ORIGINS` (default `http://localhost:3000`). On Render, set this to your Vercel URL. See [DEPLOY.md](../DEPLOY.md) at the repo root.

## AI recommendations (Groq)

When `GROQ_API_KEY` is set:

- **Title optimization** (`title_optimization`): flaw + 3 title alternatives (text model).
- **Thumbnail concepts** (`thumbnail_optimization`): analyzes the uploaded image with the vision model; returns flaw, fix, and one text-based thumbnail design brief (count set by `THUMBNAIL_GEN_COUNT`, default 1). On success, `visual_critique` is synced from the same flaw/fix.

Title and thumbnail Groq calls run **in parallel**. CTR grade and metrics remain mock/staging logic.

If Groq fails or is not configured, the API falls back to templates and still returns **200**.

## AI thumbnail images (OpenAI)

When `OPENAI_API_KEY` is set:

- After Groq title + vision (or template fallback), the API generates **1 thumbnail image** per analyze by default (`THUMBNAIL_GEN_COUNT`, via OpenAI `images.generate` / `gpt-image-1`).
- Image prompts are built with a Groq text call when `GROQ_API_KEY` is available; otherwise templated prompts from title, niche, and language.
- Results appear in `thumbnail_optimization.generated_thumbnails` as `{ prompt_used, image_base64 }` (PNG/JPEG base64, no `data:` prefix).
- Text `thumbnail_alternatives` are still returned for fallback and captions.
- **On-image text language:** Groq vision sets `on_image_text_language` from the uploaded thumbnail when readable; image prompts and concepts preserve that language and do not translate. If the upload has no on-image text, the form **Language** field is used strictly.

If OpenAI fails or is not configured, the API still returns **200** with text concepts only.

**Cost note:** each analyze can bill up to `THUMBNAIL_GEN_COUNT` image generations per OpenAI pricing.

### Response fields (analyze)

| Field | Description |
|-------|-------------|
| `title_optimization` | Title flaw + `hinglish_alternatives` (3 strings) |
| `thumbnail_optimization` | Thumbnail flaw, fix, `on_image_text_language`, `thumbnail_alternatives` (1+ concept paragraphs per `THUMBNAIL_GEN_COUNT`), `generated_thumbnails` (0–N images when OpenAI succeeds) |
| `visual_critique` | Same flaw/fix as thumbnail when Groq vision succeeds; otherwise mock |

## Deploy (Render)

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Use root directory `backend`, Python runtime from `runtime.txt`, and env vars from the table above. Full steps: [DEPLOY.md](../DEPLOY.md).

## Troubleshooting

If the API returns an error like `Input should be 'Hinglish', 'Pure Hindi' or 'Regional'` when you select **English** or another new language, the running server is stale. Stop uvicorn and restart from `backend/` with `--reload` (see **Run** above). Check http://localhost:8000/docs — the `language` field should list all 13 values.
