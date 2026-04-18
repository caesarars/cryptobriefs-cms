# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install deps
- `npm run dev` — start Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built output

There is no test runner, linter, or typecheck script configured. TS is checked by the editor/IDE only (`tsconfig.json` has `noEmit: true`).

## Required env vars (project root `.env`)

Loaded by `vite.config.ts` via `loadEnv` and re-exposed as `process.env.*` at build time:

- `GEMINI_API_KEY` — exposed as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY`
- `BASE_URL_API` — base URL for the external publishing backend (e.g. `https://apiv2.cryptobriefs.net/`); code appends `api/blog`, `api/upload`
- `APP_LOGIN_USERNAME`, `APP_LOGIN_PASSWORD` — client-side login gate (see caveat below)

All of these end up in the built JS bundle. This is a **client-only** app — treat all "env vars" as public.

## Architecture

This is a single-page Vite + React 19 + TypeScript CMS for publishing crypto articles. It is a thin UI on top of two external services:

1. **Google Gemini** (`@google/genai`) — all AI text + image generation lives in `services/geminiService.ts`. Current models: `gemini-2.5-pro` for text, `imagen-4.0-generate-001` for cover images. Images are compressed client-side (`compressBase64Image`, 1280×720, JPEG q=0.75) before being sent anywhere.
2. **Crypto Briefs publishing API** (`BASE_URL_API`) — posts + images are uploaded via raw `axios.post` calls from the page components themselves (`OneClickPost.tsx`, `AIDraftGenerator.tsx`, `AIBatchGenerator.tsx`, `PostForm.tsx`). There is no shared API client; each page re-implements the upload/publish flow.

`services/firebaseService.ts` is a stub with placeholder credentials and is **not** wired into the app, despite `firebase` being in `package.json`.

### Auth model

`App.tsx` implements a purely client-side session:

- Credentials are compared against `APP_LOGIN_USERNAME` / `APP_LOGIN_PASSWORD` in-bundle.
- On success, a random UUID token + 8h expiry is stored in `sessionStorage` under `cryptobriefs-session`.
- An interval checks expiry every 30s and logs the user out.

This is a UI gate, not real auth — the Gemini key and publishing endpoint are callable from any browser with the bundle. Don't add features that assume server-side authorization.

### Routes (all authenticated except `/login`)

- `/` — `PostForm` (manual editor with AI-assisted title/content/image)
- `/one-click` — `OneClickPost` (generate + publish in one click)
- `/ai-draft` — `AIDraftGenerator`
- `/ai-batch` — `AIBatchGenerator` (pick N trending ideas, generate + publish each)

### Content contract: SEO brief prefix

`generateBlogPost` in `geminiService.ts` forces the model to emit a structured Markdown header before the article body:

```markdown
**Title:** ...
**Primary Keyword:** ...
**Secondary Keywords:** ...
**Search Intent:** ...
**Target Word Count:** ...
### Structure
1. ...
```

`PostForm.tsx` defines `normalizeGeneratedContentForPublish` which **strips this header (and a leading duplicate H1) before sending content to the publishing API**. If you change the prompt's header format in `geminiService.ts`, update the `SEO_BRIEF_PREFIXES` array and the structure-block handling in the normalizer — they are coupled. The batch/one-click generators rely on the same contract.

### Styling

Tailwind is loaded via CDN in `index.html` (no PostCSS pipeline), with a small custom palette (`brand-primary`, `brand-secondary`, `brand-accent`, `brand-text`, `brand-text-secondary`) inlined in the same file. `index.html` also declares an `importmap` for React/marked/dompurify — this exists alongside Vite's bundling and can be ignored for normal dev.

## Gotchas

- `process.env.API_KEY` is populated from `GEMINI_API_KEY`; do not rename one without the other.
- Publishing flow expects `BASE_URL_API` to end with a trailing slash (code does `${BASE_URL_API}api/blog`).
- `types.ts` defines `Post` and `constants.ts` has `INITIAL_POSTS`, but the live app never reads them — they are leftover from an earlier list-view version (see `components/PostList.tsx`, `PostDetail.tsx`, which are also unrouted).
