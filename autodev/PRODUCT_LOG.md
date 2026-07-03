# JobTrack AI — Autodev Brain

Shared memory for the two autonomous agents (**Forge** = builder, **Sentinel** = reviewer/QA).
Read this first every run; update it last. One meaningful, reviewable increment per day.

Policy: **balanced** — alternate stabilization and features across days. Everything ships to the
`autodev` branch via a single open PR to `main`. Never touch `main`, secrets, or deploys.

---

## PRODUCT VISION (set by Muzaffar, 2026-07-01)
JobTrack AI helps job seekers (1) **track applications automatically** across job sites, (2) **tailor
their resume to a JD in ATS format** with the right keywords, and (3) see a **daily dashboard +
downloadable spreadsheet**. Two surfaces: a **browser extension** (`extension/`) and the **React web
app** (`src/`). Honest constraint: the extension can only track in-browser applying, so tracking is
**hybrid** — auto-detect on major sites + one-click manual log.

### Phase plan
- **P1 — Extension MVP (tracking):** ✅ built 2026-07-01 (hybrid auto-detect + one-click log, badge, local storage).
- **P2 — Dashboard + export:** ✅ built 2026-07-01 (extension dashboard: stats, 14-day chart, table, CSV export).
- **P3 — Resume tailoring:** ✅ shipped in both surfaces. Web app 2026-07-01 (`api/tailor.js` + `src/ResumeTailor.jsx`, "✨ Tailor Resume" tab). Extension 2026-07-03 (`tailor.html`/`.js`, "✨ Tailor" button per dashboard row, `options.html` for web-app URL + resume text — see `extension/lib/settings.js`). Still open: DOCX/PDF export of the tailored resume (currently `.txt` in both surfaces); a "tailor for this job" button on **web app** tracker rows (extension already has it).
- **P4 — Sync + web dashboard (agents):** optional account/cloud sync so the React web app mirrors the extension's data across devices; true .xlsx export (vendor SheetJS locally — no remote code, MV3 CSP).

---

## NOW (current focus)
- "Tailor for this job" button on **web app** tracker rows (reuse `api/tailor.js` with the job's saved JD) — mirrors what the extension dashboard already has.

## NEXT
- DOCX/PDF export of the tailored resume (currently plain `.txt`) in both surfaces.
- Define a shared application-record schema so extension + web app agree (P4 groundwork).
- True Excel (.xlsx) export in the extension dashboard by vendoring SheetJS locally.

## LATER (feature backlog)
- Extension: edit (not just delete) entries; weekly/monthly views; per-status pipeline.
- Extension: expand auto-detect coverage (Workday multi-step, SmartRecruiters, iCIMS).
- Web app: job status pipeline (Saved→Applied→Interview→Offer→Rejected) + filters + tags + search.
- Web app: dashboard stats parity with the extension; charts over time.
- Improve AI match analysis output (structured pros/cons, suggested resume tweaks).
- Empty/loading states + mobile responsiveness pass.

## IN PROGRESS
- (none)

## DONE LOG
- 2026-07-03 — **Extension resume tailoring shipped:** `extension/tailor.html/.js/.css` (paste a JD, get ATS resume + match score + missing keywords + suggestions, copy/download .txt), a "✨ Tailor" button on each dashboard row (passes company/title as context), and `extension/options.html/.js/.css` (Settings page for the web app URL + resume text, via new `extension/lib/settings.js`). `api/tailor.js` now sets CORS headers (`Access-Control-Allow-Origin: *`, handles `OPTIONS` preflight) so the extension's chrome-extension:// origin can call it — no cookies/session involved, key stays server-side. Added 5 unit tests for `settings.js`. Build + lint + all 19 tests green. Requested by Muzaffar directly (not the daily autodev cadence). See autodev/reports/2026-07-03.md.
- 2026-07-02 — **Tests added:** Vitest + Testing Library wired up (`npm test`). 12 unit tests for `extension/lib/db.js` (todayStr, addApp defaults/dedupe/distinct URLs, deleteApp, statsFrom, lastNDays, toCSV incl. quoting) + 2 smoke tests for `src/App.jsx` (mounts without throwing, renders the signed-out gate). ESLint taught `*.test.{js,jsx}` globals. Build + lint + tests all green. See autodev/reports/2026-07-02.md.
- 2026-07-01 — **P3 core shipped:** AI resume tailoring in the web app — `api/tailor.js` (server-side prompt, returns `{atsResume, matchScore, missingKeywords[], suggestions[]}`, key stays server-side) + `src/ResumeTailor.jsx` new "✨ Tailor Resume" tab with copy/download. Build + lint green. Live endpoint not run locally (Vercel functions + real key needed). See autodev/reports/2026-07-01.md.
- 2026-07-01 — **P1+P2 shipped:** browser extension (`extension/`) with hybrid tracking (auto-detect on LinkedIn/Indeed/Greenhouse/Lever/Workday/Ashby + one-click log), toolbar badge, dashboard (stats, 14-day chart, table, CSV export). Storage layer unit-verified in Node. ESLint taught extension globals. See autodev/reports/2026-07-01.md.
- 2026-06-30 — App-wide ErrorBoundary added (no more blank screen on render errors); fixed all 3 pre-existing ESLint errors for a green baseline; repo scaffolded (CLAUDE.md + brain). See autodev/reports/2026-06-30.md.

## OPEN QUESTIONS FOR MUZAFFAR
- Tailored-resume export is currently plain-text (.txt) in both surfaces. Want DOCX/PDF? (Agents can add it.)
- Extension tailoring needs the deployed web app's URL, entered once in Settings — nothing is hardcoded/guessed. If the web app moves domains, update it there.
