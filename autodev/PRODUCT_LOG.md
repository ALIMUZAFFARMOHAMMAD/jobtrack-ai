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
- **P3 — Resume tailoring (agents build next):** JD + resume → Claude returns an ATS-formatted, keyword-optimized resume + match score + gap list. Extend `api/analyze.js` (or add `api/tailor.js`); surface in the web app and/or a "Tailor resume" view in the extension.
- **P4 — Sync + web dashboard (agents):** optional account/cloud sync so the React web app mirrors the extension's data across devices; true .xlsx export (vendor SheetJS locally — no remote code, MV3 CSP).

---

## NOW (current focus)
- **P3: Resume tailoring.** Accept `{resume, jobDescription}` and return `{atsResume, matchScore, missingKeywords[], suggestions[]}` from the serverless function. Add a simple web-app view to paste both and show the result. Keep the API key server-side only; never expose it to the client/extension.

## NEXT
- Add a lightweight test setup (Vitest + RTL) — start with a web-app smoke test AND unit tests for `extension/lib/db.js` (pure logic, easy wins).
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
- 2026-07-01 — **P1+P2 shipped:** browser extension (`extension/`) with hybrid tracking (auto-detect on LinkedIn/Indeed/Greenhouse/Lever/Workday/Ashby + one-click log), toolbar badge, dashboard (stats, 14-day chart, table, CSV export). Storage layer unit-verified in Node. ESLint taught extension globals. See autodev/reports/2026-07-01.md.
- 2026-06-30 — App-wide ErrorBoundary added (no more blank screen on render errors); fixed all 3 pre-existing ESLint errors for a green baseline; repo scaffolded (CLAUDE.md + brain). See autodev/reports/2026-06-30.md.

## OPEN QUESTIONS FOR MUZAFFAR
- Resume tailoring UI: prefer it in the **web app**, the **extension**, or both? (Agents will default to the web app first — richer editing surface — unless told otherwise.)
