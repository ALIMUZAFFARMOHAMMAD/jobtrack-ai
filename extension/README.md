# JobTrack AI — Browser Extension

Tracks your job applications while you apply, so you can see how many you've sent
per day, keep a streak, and export the data.

## Features (Phases 1–3)
- **Hybrid tracking:** auto-detects application submissions on LinkedIn, Indeed,
  Greenhouse, Lever, Workday, and Ashby, **plus** a one-click "Log application"
  button in the popup that works on any site (auto-fills role/company/URL from the
  current tab).
- **Toolbar badge** shows today's application count.
- **Dashboard** (`dashboard.html`): today / last-7-days / streak / total, a 14-day
  bar chart, and a full table (with delete to fix mis-detections, and a "✨ Tailor"
  button per row).
- **CSV export** that opens in Excel or Google Sheets.
- **AI resume tailoring** (`tailor.html`): paste a job description, get an
  ATS-optimized rewrite of your resume, a match score, missing keywords, and
  suggestions — calls the same `/api/tailor` endpoint as the web app. Set your
  resume text and the deployed web app's URL once in **Settings** (`options.html`).
  Download the result as `.docx` (built by hand from a minimal OOXML template +
  vendored JSZip), `.txt`, or print/save as PDF.

Coming next (built by the autodev agents): optional cloud sync with the web app
(Phase 4).

## Install (development)
1. Open `chrome://extensions` (or `edge://extensions`).
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked** and select this `extension/` folder.
4. Pin the JobTrack AI icon. Click it on any job page to log an application.

> No icon files are bundled yet, so Chrome shows a default puzzle-piece icon —
> that's expected for the MVP.

## How tracking works
- Auto-detect fires when you click a strong "submit application / apply now / easy
  apply" control on a supported site. Plain "Submit" counts only on dedicated ATS
  domains (Greenhouse/Lever/Workday/Ashby).
- Everything is deduped to **one entry per URL per day**, so double-clicks or
  re-detections don't inflate the count.
- All data is stored locally in `chrome.storage.local` — nothing leaves your
  browser (until optional cloud sync in Phase 4).

## Files
- `manifest.json` — MV3 config, permissions, content-script matches.
- `background.js` — service worker: stores events, updates the badge.
- `content/detect.js` — auto-detection on supported sites.
- `popup.html/.js/.css` — quick stats + one-click logging.
- `dashboard.html/.js/.css` — full dashboard + CSV export.
- `tailor.html/.js/.css` — AI resume tailoring against a pasted job description.
- `options.html/.js/.css` — Settings: web app URL + resume text.
- `lib/db.js` — shared storage + stats + CSV helpers.
- `lib/settings.js` — API base URL + resume text storage helpers.
- `lib/docx.js` — builds a minimal valid `.docx` from plain text using JSZip.
- `lib/vendor/` — third-party code vendored locally (MV3 CSP forbids remote scripts).
