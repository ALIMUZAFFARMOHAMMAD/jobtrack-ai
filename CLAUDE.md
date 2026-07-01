# JobTrack AI — project context

AI-assisted job application tracker. Users add jobs; an AI endpoint scores how well a job matches them.

## Product (see autodev/PRODUCT_LOG.md for the phase plan)
Two surfaces working toward the same goal — help people track applications, tailor resumes to a JD in ATS format, and see a daily dashboard + spreadsheet:
1. **Browser extension** (`extension/`) — tracks applications in-browser (hybrid: auto-detect on major job sites + one-click log), badge, dashboard, CSV export. Plain MV3 (no build step). Shared logic in `extension/lib/db.js`.
2. **React web app** (`src/`) — the richer surface; will host resume tailoring (P3) and a synced dashboard (P4).

## Stack
- **Frontend:** React 19 + Vite 8, single-page app. Main UI lives in `src/App.jsx` (+ `src/App.css`, `src/index.css`). Entry: `src/main.jsx` / `index.html`. Wrapped in `src/ErrorBoundary.jsx`.
- **Extension:** Manifest V3, vanilla JS/HTML (no bundler). Content scripts message the service worker; data in `chrome.storage.local`. MV3 CSP forbids remote code — vendor any library locally.
- **Backend:** serverless function `api/analyze.js` calls the Anthropic API (Claude). Resume tailoring (P3) extends this or adds `api/tailor.js`. Keep the API key server-side only — never ship it to the client or extension.
- **Secrets:** `ANTHROPIC_API_KEY` in `.env.local` (gitignored). NEVER read, print, commit, or move this file.
- **Deploy:** production deploys from `main` (Vercel-style). Do NOT push to `main` and do NOT deploy.

## Commands
- Dev: `npm run dev`
- Build (must pass before any commit): `npm run build`
- Lint (must pass): `npm run lint`

## History / known pain
The app has repeatedly broken to a blank screen — usually from unsafe `localStorage` access on first render and from template-literal / animation code. Prefer small, defensive changes. Guard browser APIs. Verify `npm run build` succeeds AND the app renders (no blank screen) before committing.

## Notes
- `fix_app.py` is a legacy one-off rewrite script, not part of the app runtime.
- No test framework is set up yet; adding a lightweight one (e.g. Vitest) is a welcome early improvement.
