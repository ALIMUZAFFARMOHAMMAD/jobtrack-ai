# Vendored libraries

MV3 CSP forbids loading remote scripts, so third-party code used by the extension is
vendored here as a plain local file instead of pulled from a CDN.

- `jszip.min.js` — [JSZip](https://stuk.github.io/jszip/) v3.10.1, dual MIT/GPLv3
  licensed. Unmodified upstream build (`node_modules/jszip/dist/jszip.min.js`). Used
  by `tailor.js` to build a minimal valid `.docx` (OOXML is just a ZIP archive).
