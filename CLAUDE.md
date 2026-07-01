# JobTrack AI — project context

AI-assisted job application tracker. Users add jobs; an AI endpoint scores how well a job matches them.

## Stack
- **Frontend:** React 19 + Vite 8, single-page app. Main UI lives in `src/App.jsx` (+ `src/App.css`, `src/index.css`). Entry: `src/main.jsx` / `index.html`.
- **Backend:** one serverless function `api/analyze.js` that calls the Anthropic API (Claude) to analyze job/candidate fit.
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
