import { getApiBaseUrl, getResumeText } from "./lib/settings.js";
import { textToDocxBlob } from "./lib/docx.js";
import { textToPdfBlob } from "./lib/pdf.js";

const $ = (id) => document.getElementById(id);

function scoreColor(s) {
  return s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function download(filename, text, mime) {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

function showJobContext() {
  const params = new URLSearchParams(location.search);
  const company = params.get("company") || "";
  const title = params.get("title") || "";
  if (!company && !title) return;
  const el = $("jobCtx");
  el.textContent = `Tailoring for: ${title || "Unknown role"}${company ? " at " + company : ""}`;
  el.hidden = false;
}

async function init() {
  showJobContext();

  const resume = await getResumeText();
  const apiBase = await getApiBaseUrl();
  const hasResume = resume.trim().length > 50;

  $("noResume").hidden = hasResume;
  $("noApiBase").hidden = !!apiBase;
  $("run").disabled = !hasResume || !apiBase;

  $("run").addEventListener("click", async () => {
    const error = $("error");
    error.hidden = true;
    $("result").hidden = true;

    const jd = $("jd").value.trim();
    if (jd.length < 30) {
      error.textContent = "Paste the full job description first.";
      error.hidden = false;
      return;
    }

    $("run").disabled = true;
    $("run").textContent = "Tailoring…";
    try {
      const res = await fetch(`${apiBase}/api/tailor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription: jd }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      renderResult(await res.json());
    } catch (e) {
      error.textContent = "Tailoring failed: " + e.message;
      error.hidden = false;
    }
    $("run").disabled = false;
    $("run").textContent = "✨ Tailor my resume";
  });
}

function renderResult(result) {
  $("result").hidden = false;

  const scoreBox = $("scoreBox");
  if (typeof result.matchScore === "number") {
    $("scoreNum").textContent = result.matchScore;
    $("scoreNum").style.color = scoreColor(result.matchScore);
    scoreBox.hidden = false;
  } else {
    scoreBox.hidden = true;
  }

  const keywordsBox = $("keywordsBox");
  const keywords = $("keywords");
  keywords.innerHTML = "";
  if (result.missingKeywords?.length) {
    for (const k of result.missingKeywords) {
      const span = document.createElement("span");
      span.textContent = k;
      keywords.appendChild(span);
    }
    keywordsBox.hidden = false;
  } else {
    keywordsBox.hidden = true;
  }

  const suggestionsBox = $("suggestionsBox");
  const suggestions = $("suggestions");
  suggestions.innerHTML = "";
  if (result.suggestions?.length) {
    for (const s of result.suggestions) {
      const li = document.createElement("li");
      li.textContent = s;
      suggestions.appendChild(li);
    }
    suggestionsBox.hidden = false;
  } else {
    suggestionsBox.hidden = true;
  }

  $("atsResume").textContent = result.atsResume || "";
}

$("copy").addEventListener("click", async () => {
  const text = $("atsResume").textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    const btn = $("copy");
    const original = btn.textContent;
    btn.textContent = "✓ Copied";
    setTimeout(() => { btn.textContent = original; }, 1500);
  } catch {
    const error = $("error");
    error.textContent = "Couldn't copy — select the text and copy manually.";
    error.hidden = false;
  }
});

$("download").addEventListener("click", () => {
  const text = $("atsResume").textContent;
  if (!text) return;
  download("tailored-resume.txt", text, "text/plain;charset=utf-8");
});

$("downloadDocx").addEventListener("click", async () => {
  const text = $("atsResume").textContent;
  if (!text) return;
  const btn = $("downloadDocx");
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Building…";
  try {
    downloadBlob(await textToDocxBlob(text), "tailored-resume.docx");
  } catch (e) {
    const error = $("error");
    error.textContent = "Couldn't build the .docx file: " + e.message;
    error.hidden = false;
  }
  btn.disabled = false;
  btn.textContent = original;
});

$("downloadPdf").addEventListener("click", () => {
  const text = $("atsResume").textContent;
  if (!text) return;
  const btn = $("downloadPdf");
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Building…";
  try {
    downloadBlob(textToPdfBlob(text), "tailored-resume.pdf");
  } catch (e) {
    const error = $("error");
    error.textContent = "Couldn't build the .pdf file: " + e.message;
    error.hidden = false;
  }
  btn.disabled = false;
  btn.textContent = original;
});

init();
