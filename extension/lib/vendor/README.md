# Vendored libraries

MV3 CSP forbids loading remote scripts, so third-party code used by the extension is
vendored here as a plain local file instead of pulled from a CDN.

- `jszip.min.js` — [JSZip](https://stuk.github.io/jszip/) v3.10.1, dual MIT/GPLv3
  licensed. Unmodified upstream build (`node_modules/jszip/dist/jszip.min.js`). Used
  by `tailor.js` to build a minimal valid `.docx` (OOXML is just a ZIP archive).
- `jspdf.umd.min.js` — [jsPDF](https://github.com/MrRio/jsPDF) v4.2.1, MIT licensed.
  Unmodified upstream UMD build (`node_modules/jspdf/dist/jspdf.umd.min.js`), exposes
  `window.jspdf.jsPDF`. Used by `tailor.js` for one-click `.pdf` export (same approach
  as the web app's `src/ResumeTailor.jsx`, which uses the npm package directly).
