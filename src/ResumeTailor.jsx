import { useState } from "react";

// P3 — AI resume tailoring. Paste a job description; get an ATS-optimized rewrite
// of your resume plus a match score, missing keywords, and suggestions.
export default function ResumeTailor({ resumeText }) {
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const hasResume = (resumeText || "").trim().length > 50;

  async function run() {
    setError("");
    setResult(null);
    if (!hasResume) { setError("Add your resume in the My Resume tab first."); return; }
    if (jd.trim().length < 30) { setError("Paste the full job description first."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText, jobDescription: jd }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setResult(await res.json());
    } catch (e) {
      setError("Tailoring failed: " + e.message);
    }
    setLoading(false);
  }

  async function copyResume() {
    if (!result?.atsResume) return;
    try {
      await navigator.clipboard.writeText(result.atsResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Couldn't copy — select the text and copy manually.");
    }
  }

  function downloadResume() {
    if (!result?.atsResume) return;
    const blob = new Blob([result.atsResume], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tailored-resume.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const card = { background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };
  const scoreColor = (s) => (s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444");

  return (
    <div style={card}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>✨ Tailor Resume to a Job</h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
        Paste a job description. Claude rewrites your saved resume in ATS-friendly format, adds the
        keywords it truthfully can, and scores the fit.
      </p>

      {!hasResume && (
        <div style={{ background: "#fffbeb", border: "1px dashed #fde68a", borderRadius: 12, padding: 16, marginBottom: 16, color: "#92400e", fontSize: 14 }}>
          📄 Add your resume in the <strong>My Resume</strong> tab first — this tailors that resume.
        </div>
      )}

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste the full job description here..."
        style={{ width: "100%", minHeight: 160, padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, color: "#1e293b", resize: "vertical", outline: "none", fontFamily: "inherit" }}
      />

      <button
        onClick={run}
        disabled={loading}
        style={{ marginTop: 14, background: loading ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Tailoring…" : "✨ Tailor my resume"}
      </button>

      {error && <p style={{ color: "#dc2626", fontSize: 14, marginTop: 14 }}>⚠️ {error}</p>}

      {result && (
        <div style={{ marginTop: 24 }}>
          {typeof result.matchScore === "number" && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "8px 16px", marginBottom: 18 }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Match score</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor(result.matchScore) }}>{result.matchScore}</span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>/100</span>
            </div>
          )}

          {result.missingKeywords?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>🏷️ Keywords to add (truthfully)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {result.missingKeywords.map((k, i) => (
                  <span key={i} style={{ background: "#fef2f2", color: "#b91c1c", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{k}</span>
                ))}
              </div>
            </div>
          )}

          {result.suggestions?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>💡 Suggestions</div>
              <ul style={{ margin: 0, paddingLeft: 20, color: "#334155", fontSize: 13.5, lineHeight: 1.7 }}>
                {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>📄 ATS-optimized resume</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={copyResume} style={{ background: "#eef2ff", color: "#4338ca", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{copied ? "✓ Copied" : "Copy"}</button>
              <button onClick={downloadResume} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Download .txt</button>
            </div>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, fontSize: 13, lineHeight: 1.6, color: "#0f172a", fontFamily: "inherit", maxHeight: 480, overflow: "auto" }}>{result.atsResume}</pre>
        </div>
      )}
    </div>
  );
}
