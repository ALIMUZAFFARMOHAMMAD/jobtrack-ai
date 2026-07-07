# JobTrack AI — project context

AI-assisted job application tracker. Users add jobs; an AI endpoint scores how well a job matches them.

## Product (see autodev/PRODUCT_LOG.md for the phase plan)
Two surfaces working toward the same goal — help people track applications, tailor resumes to a JD in ATS format, and see a daily dashboard + spreadsheet:
1. **Browser extension** (`extension/`) — tracks applications in-browser (hybrid: auto-detect on major job sites + one-click log), badge, dashboard, CSV export, and AI resume tailoring (`tailor.html`, calls the shared `/api/tailor` endpoint). Plain MV3 (no build step). Shared logic in `extension/lib/db.js` and `extension/lib/settings.js`.
2. **React web app** (`src/`) — the richer surface; hosts resume tailoring (P3, `src/ResumeTailor.jsx`) and will host a synced dashboard (P4).

## Stack
- **Frontend:** React 19 + Vite 8, single-page app. Main UI lives in `src/App.jsx` (+ `src/App.css`, `src/index.css`). Entry: `src/main.jsx` / `index.html`. Wrapped in `src/ErrorBoundary.jsx`.
- **Extension:** Manifest V3, vanilla JS/HTML (no bundler). Content scripts message the service worker; data in `chrome.storage.local`. MV3 CSP forbids remote code — vendor any library locally. `tailor.html`/`options.html` are extension pages (not content scripts), so they can `fetch()` cross-origin to the deployed web app — `api/tailor.js` sets permissive CORS headers for this. The extension's web app URL + resume text are set once in `options.html`, stored via `extension/lib/settings.js`.
- **Backend:** serverless functions `api/analyze.js` and `api/tailor.js` call the Anthropic API (Claude). Keep the API key server-side only — never ship it to the client or extension.
- **Secrets:** `ANTHROPIC_API_KEY` in `.env.local` (gitignored). NEVER read, print, commit, or move this file.
- **Deploy:** production deploys from `main` (Vercel-style). Do NOT push to `main` and do NOT deploy.

## Commands
- Dev: `npm run dev`
- Build (must pass before any commit): `npm run build`
- Lint (must pass): `npm run lint`
- Test: `npm test` (Vitest — `extension/lib/*.test.js` + `src/App.test.jsx` smoke test)

## History / known pain
The app has repeatedly broken to a blank screen — usually from unsafe `localStorage` access on first render and from template-literal / animation code. Prefer small, defensive changes. Guard browser APIs. Verify `npm run build` succeeds AND the app renders (no blank screen) before committing.

## Resume export (DOCX/PDF)
- **Web app** (`src/ResumeTailor.jsx`): uses the `docx` and `jspdf` npm packages, both dynamically `import()`ed only when the corresponding download button is clicked — keeps them out of the initial bundle (they're large; `jspdf` pulls in `html2canvas`). Copy and `.txt` download remain available too.
- **Extension** (`extension/tailor.js`): one-click `.docx` and `.pdf`, matching the web app's UX exactly (no print dialog). `.docx` is built by hand (`extension/lib/docx.js`) — a minimal valid OOXML document zipped with a vendored local copy of JSZip (`extension/lib/vendor/jszip.min.js`). `.pdf` uses `extension/lib/pdf.js` (same pagination logic as the web app) against a vendored local copy of jsPDF's UMD build (`extension/lib/vendor/jspdf.umd.min.js`, exposes `window.jspdf.jsPDF`). Both are vendored because MV3 CSP forbids remote scripts — they can't be pulled from a CDN at runtime.
- Known upstream quirk: `jsPDF`'s bundled AcroForm plugin logs harmless `PubSub Error ... reading 'root'` to the console on every `.save()`/`.output()` call even though no form fields are used. The generated PDF is valid (`%PDF-1.3` header, correct `%%EOF` trailer) — verified manually. Not something to "fix" in our code.

