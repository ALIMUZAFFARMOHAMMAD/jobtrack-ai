// Builds a paginated, selectable-text PDF Blob from plain text, using the
// vendored jsPDF (loaded globally via lib/vendor/jspdf.umd.min.js — MV3 CSP
// forbids remote scripts, so it can't be pulled from a CDN). Mirrors the web
// app's downloadPdf logic in src/ResumeTailor.jsx.

export function textToPdfBlob(text) {
  const jsPDF = window.jspdf && window.jspdf.jsPDF;
  if (!jsPDF) throw new Error("jsPDF failed to load");

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const marginX = 54;
  const marginY = 54;
  const lineHeight = 14;
  const maxWidth = doc.internal.pageSize.getWidth() - marginX * 2;
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);

  const lines = doc.splitTextToSize(text, maxWidth);
  let y = marginY;
  for (const line of lines) {
    if (y > pageHeight - marginY) {
      doc.addPage();
      y = marginY;
    }
    doc.text(line, marginX, y);
    y += lineHeight;
  }

  return doc.output("blob");
}
