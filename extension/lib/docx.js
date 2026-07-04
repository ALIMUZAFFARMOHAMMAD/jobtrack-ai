// Builds a minimal valid .docx (OOXML) Blob from plain text, using the vendored
// JSZip (loaded globally via lib/vendor/jszip.min.js — MV3 CSP forbids remote
// scripts, so it can't be pulled from a CDN). A .docx is just a ZIP archive with
// a handful of required XML parts; this writes only what's needed to open cleanly
// in Word / Google Docs / LibreOffice.

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function paragraphsXml(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => {
      const t = escapeXml(line);
      return t ? `<w:p><w:r><w:t xml:space="preserve">${t}</w:t></w:r></w:p>` : "<w:p/>";
    })
    .join("");
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

export async function textToDocxBlob(text) {
  const JSZip = window.JSZip;
  if (!JSZip) throw new Error("JSZip failed to load");

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${paragraphsXml(text)}<w:sectPr/></w:body>
</w:document>`;

  const zip = new JSZip();
  zip.file("[Content_Types].xml", CONTENT_TYPES);
  zip.file("_rels/.rels", RELS);
  zip.file("word/document.xml", documentXml);

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
