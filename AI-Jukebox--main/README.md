# AIJukebox

AIJukebox turns a natural-language task ("turn my research paper into a
3-minute video") into a dynamically generated workflow, with multiple real
AI tools recommended for every stage.

```
USER → React frontend → Express backend → LLM (intent) → MongoDB (tool
search) → Recommendation engine → Workflow → React frontend → tool cards
```

This is a real full-stack project: a React/Vite frontend, an Express
backend, a MongoDB-backed tool catalog, and live calls to the Anthropic
API for task understanding. No step in `/api/analyze-task` is mocked or
hardcoded — only the *seed tool catalog* is hardcoded data, which the spec
explicitly allows (the LLM identifies capabilities; the database and
scoring engine decide which real tools match).

## Project layout

```
aijukebox/
├── backend/     Express API, MongoDB models, LLM + recommendation logic
└── frontend/    React (Vite + Tailwind) app
```

## Prerequisites

- Node.js 18+
- MongoDB (optional for the bundled-catalog demo; required to persist workflows and manage the catalog)
- An Anthropic API key (https://console.anthropic.com/) — or swap in
  another provider by editing `backend/src/services/llmService.js`

## 1. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env: set MONGODB_URI and ANTHROPIC_API_KEY
npm install
npm run seed   # loads ~45 real AI tools into the "tools" collection
npm run dev    # starts the API on http://localhost:4000
```

Health check: `curl http://localhost:4000/api/health`

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env   # optional in dev — Vite proxies /api to :4000
npm install
npm run dev             # http://localhost:5173
```

Open http://localhost:5173 and try the primary demo query:

> "I have a 10-page PDF research paper and I want to turn it into a
> 3-minute educational video. I prefer free tools and need API access."

## How each piece maps to the spec

| Spec requirement | Implementation |
|---|---|
| Real LLM call, structured JSON, no invented tools | `backend/src/services/llmService.js` — calls the Anthropic Messages API, prompted to return only capabilities, never tool names |
| Task decomposition, variable stage count | LLM produces `stages[]`; nothing hardcodes the number or shape of stages |
| Tool database → real tools per capability | `backend/src/services/recommendationEngine.js` queries MongoDB and scores results 0–100 |
| Multiple tools per stage (5–10 target) | `recommendToolsForStage` returns up to 10 ranked matches, fewer if genuinely fewer exist — never padded |
| Explainable results | Each recommendation carries a `reasons[]` array surfaced on the tool card |
| `/api/analyze-task`, `/api/recommend-tools`, `/api/tools`, `/api/tools/:id` | `backend/src/routes/*.js` |
| No secrets in the frontend | `ANTHROPIC_API_KEY` and `MONGODB_URI` only ever read via `process.env` in backend code |
| Progressive disclosure UI (stages first, tools on expand) | `frontend/src/components/WorkflowStage.jsx` — accordion, closed by default except stage 1 |
| Filters, comparison (up to 3), favorites, recent tasks, recently used | `frontend/src/components/{Filters,ComparisonBar}.jsx`, `frontend/src/hooks/useLocalList.js` (localStorage for the MVP, as the spec allows) |
| Rainbow/jukebox visual identity, subtle motion | `frontend/tailwind.config.js` design tokens, `IntroAnimation.jsx`, `ProcessingState.jsx` |

## Known simplifications (documented, not hidden)

- **History/saved/recently-used** use `localStorage`, exactly as the spec
  permits for the no-login MVP. `Search` and `Workflow` Mongo collections
  already exist so this can move server-side once accounts ship.
- **Vector/embedding search** (spec's optional Phase 2) isn't implemented —
  matching is capability + tag based with a synonym map. The scoring
  function is isolated in `recommendationEngine.js` so swapping in vector
  search later doesn't touch the routes or frontend.
- **Seed catalog** (~45 tools) covers every category the spec lists but is
  a starting point, not exhaustive — pricing/feature fields are best-effort
  and should be reviewed periodically since vendors change plans.
- This was authored outside a live network sandbox, so `npm install` /
  `npm run seed` / a running MongoDB have not been executed here — run the
  setup steps above locally to install dependencies and verify end-to-end.

## Deploying

- **Backend**: any Node host (Render, Fly.io, Railway, a VPS). Set
  `MONGODB_URI`, `ANTHROPIC_API_KEY`, `CLIENT_ORIGIN` as environment
  variables — never commit `.env`.
- **Frontend**: `npm run build` in `frontend/`, deploy the `dist/` folder
  (Vercel, Netlify, static hosting). Set `VITE_API_BASE` to your deployed
  backend's URL.
