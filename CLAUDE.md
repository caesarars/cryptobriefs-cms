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
- `APP_ADMIN_TOKEN` — admin credential for the publishing backend's `requireAdmin` middleware; attached as the `x-admin-key` header by `services/apiClient.ts`. Without it, `api/upload`/`api/blog` return 401.
- `APP_LOGIN_USERNAME`, `APP_LOGIN_PASSWORD` — client-side login gate (see caveat below)

All of these end up in the built JS bundle. This is a **client-only** app — treat all "env vars" as public.

## Architecture

This is a single-page Vite + React 19 + TypeScript CMS for publishing crypto articles. It is a thin UI on top of two external services:

1. **Google Gemini** (`@google/genai`) — all AI text + image generation lives in `services/geminiService.ts`. Current models: `gemini-3.1-pro-preview` (`TEXT_MODEL`) for text, `gemini-3.1-flash-image` (`IMAGE_MODEL`, Nano Banana — the whole Imagen family was retired for new users) for cover/section images — both are `const`s at the top of the file, update them there when Google deprecates a model again. Note the native image models use `ai.models.generateContent` with `config.responseModalities: ['TEXT','IMAGE']` + `config.imageConfig.aspectRatio`, and return bytes as inline data (see `extractInlineImageBytes`) — **not** the old `generateImages`/`generatedImages` shape, which requires `@google/genai` ≥ 1.45. Images are compressed client-side (`compressBase64Image`, 1280×720, JPEG q=0.75) before being sent anywhere.
2. **Crypto Briefs publishing API** (`BASE_URL_API`) — posts + images are uploaded from the page components (`OneClickPost.tsx`, `AIDraftGenerator.tsx`, `AIBatchGenerator.tsx`, `PostForm.tsx`). All calls go through the shared `services/apiClient.ts` axios instance, whose request interceptor attaches the `x-admin-key: ${APP_ADMIN_TOKEN}` header (the backend's `requireAdmin` gate). Each page still builds its own request URL/body; only the HTTP client + auth header are shared. If the backend changes the auth header/scheme, change only the interceptor in `apiClient.ts`.

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
