# JobTrack AI — Autodev Brain

Shared memory for the two autonomous agents (**Forge** = builder, **Sentinel** = reviewer/QA).
Read this first every run; update it last. One meaningful, reviewable increment per day.

Policy: **balanced** — alternate stabilization and features across days. Everything ships to the
`autodev` branch via a single open PR to `main`. Never touch `main`, secrets, or deploys.

---

## NOW (current focus)
- Establish a stable, tested base for `src/App.jsx` before layering features.

## NEXT
- Add a lightweight test setup (Vitest + React Testing Library) and a first smoke test (mount App, assert no throw) — makes render regressions catchable.
- Harden all `localStorage` / browser-API access behind safe guards.

## LATER (feature backlog — pull the top item on "feature" days)
- Job status pipeline (Saved → Applied → Interview → Offer → Rejected) with filtering.
- Tags/labels on jobs + search.
- Dashboard stats (counts per status, avg match score, applications over time).
- Export jobs to CSV/JSON.
- Improve AI match analysis output (structured pros/cons, suggested resume tweaks).
- Empty states, loading states, and mobile responsiveness pass.

## IN PROGRESS
- (none)

## DONE LOG
- 2026-06-30 — App-wide ErrorBoundary added (no more blank screen on render errors); fixed all 3 pre-existing ESLint errors for a green baseline; repo scaffolded (CLAUDE.md + brain). See autodev/reports/2026-06-30.md.

## OPEN QUESTIONS FOR MUZAFFAR
- (none yet — will be listed here and in the daily report when a decision is needed)
