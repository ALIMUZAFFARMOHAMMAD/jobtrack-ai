import { useState } from "react";

const EMPTY_RESUME = `Paste your resume text here...

EXAMPLE FORMAT:
Name: John Doe
Email: john@example.com

SKILLS: Product Management, SQL, Power BI, Agile/Scrum, JIRA...

EXPERIENCE:
- Company Name (dates): Brief description of role and achievements.

PROJECTS: Project name — tools used, outcomes achieved.`;

const STATUS_CONFIG = {
  "Saved":        { color: "#64748b", bg: "#f1f5f9" },
  "Applied":      { color: "#2563eb", bg: "#eff6ff" },
  "Interviewing": { color: "#7c3aed", bg: "#f5f3ff" },
  "Offer":        { color: "#059669", bg: "#ecfdf5" },
  "Rejected":     { color: "#dc2626", bg: "#fef2f2" },
};
const STATUSES = Object.keys(STATUS_CONFIG);

function ScoreBadge({ score }) {
  const color = score >= 80 ? "#10b981" : score >= 65 ? "#f59e0b" : "#ef4444";
  const bg    = score >= 80 ? "#ecfdf5" : score >= 65 ? "#fffbeb" : "#fef2f2";
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:4, background:bg, color, borderRadius:20, padding:"2px 10px", fontWeight:700, fontSize:13 }}>
      <span style={{ fontSize:9 }}>●</span> {score}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Saved"];
  return (
    <span style={{ background:cfg.bg, color:cfg.color, borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:600 }}>
      {status}
    </span>
  );
}

function AnalysisPanel({ analysis, loading, onRun, jobTitle, company, hasResume }) {
  if (!hasResume) return (
    <div style={{ padding:"24px", textAlign:"center", background:"#fffbeb", borderRadius:12, border:"1px dashed #fde68a" }}>
      <div style={{ fontSize:32, marginBottom:8 }}>📄</div>
      <p style={{ color:"#92400e", fontSize:14, lineHeight:1.6 }}>
        Add your resume in the <strong>My Resume</strong> tab first — the AI uses it to analyze your fit for each role.
      </p>
    </div>
  );

  if (loading) return (
    <div style={{ padding:"32px 0", textAlign:"center" }}>
      <div style={{ display:"inline-block", width:28, height:28, border:"3px solid #e2e8f0", borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{ marginTop:12, color:"#64748b", fontSize:14 }}>Analyzing your fit for this role...</p>
    </div>
  );

  if (!analysis) return (
    <div style={{ padding:"24px", textAlign:"center", background:"#f8fafc", borderRadius:12, border:"1px dashed #cbd5e1" }}>
      <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
      <p style={{ color:"#64748b", fontSize:14, marginBottom:16, lineHeight:1.6 }}>
        Run AI gap analysis for <strong>{jobTitle}</strong> at <strong>{company}</strong>.
      </p>
      <button onClick={onRun} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", fontWeight:600, fontSize:14, cursor:"pointer" }}>
        ✨ Run Gap Analysis
      </button>
    </div>
  );

  const sections = analysis.split(/\n(?=##)/).filter(Boolean);
  const icons = { "Match Score":"🎯", "Strong Matches":"✅", "Skill Gaps":"⚠️", "Keywords to Add":"🏷️", "Top Recommendation":"💡" };

  return (
    <div style={{ fontSize:14, lineHeight:1.7 }}>
      {sections.map((section, i) => {
        const lines = section.trim().split("\n");
        const heading = lines[0].replace(/^#+\s*/, "");
        const body = lines.slice(1).join("\n").trim();
        const icon = Object.entries(icons).find(([k]) => heading.includes(k))?.[1] || "📌";
        const isFirst = i === 0, isLast = i === sections.length - 1;
        return (
          <div key={i} style={{ marginBottom:16, background: isFirst?"linear-gradient(135deg,#f0fdf4,#dcfce7)":isLast?"#fffbeb":"#f8fafc", borderRadius:10, padding:"14px 16px", border:`1px solid ${isFirst?"#bbf7d0":isLast?"#fde68a":"#e2e8f0"}` }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:6, color:"#0f172a" }}>{icon} {heading}</div>
            <div style={{ color:"#334155", fontSize:13.5, whiteSpace:"pre-wrap" }}>{body}</div>
          </div>
        );
      })}
    </div>
  );
}

function WelcomeScreen({ onStart }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ maxWidth:560, textAlign:"center", animation:"fadeIn 0.6s ease" }}>
        <div style={{ width:64, height:64, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, margin:"0 auto 24px" }}>📋</div>
        <h1 style={{ color:"#fff", fontSize:40, fontWeight:800, letterSpacing:"-0.03em", margin:"0 0 8px" }}>
          JobTrack <span style={{ color:"#818cf8" }}>AI</span>
        </h1>
        <p style={{ color:"#94a3b8", fontSize:18, marginBottom:40, lineHeight:1.6 }}>
          Track every application. Know exactly what skills to highlight for each role.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:40 }}>
          {[
            { icon:"🗂", title:"Track Pipeline", desc:"Saved → Applied → Offer in one place" },
            { icon:"🤖", title:"AI Gap Analysis", desc:"See exactly what each JD wants from you" },
            { icon:"🏷️", title:"ATS Keywords", desc:"Never miss a keyword that matters" },
          ].map(f => (
            <div key={f.title} style={{ background:"rgba(255,255,255,0.05)", borderRadius:12, padding:"20px 16px", border:"1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{f.icon}</div>
              <div style={{ color:"#e2e8f0", fontWeight:700, fontSize:14, marginBottom:4 }}>{f.title}</div>
              <div style={{ color:"#64748b", fontSize:12, lineHeight:1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
        <button onClick={onStart} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", borderRadius:12, padding:"16px 40px", fontWeight:700, fontSize:16, cursor:"pointer", boxShadow:"0 8px 32px rgba(99,102,241,0.4)", letterSpacing:"0.02em" }}>
          Get Started →
        </button>
        <p style={{ color:"#475569", fontSize:12, marginTop:16 }}>Free to use · Powered by Claude AI</p>
      </div>
    </div>
  );
}

export default function App() {
  const [showWelcome, setShowWelcome]   = useState(true);
  const [jobs, setJobs]                 = useState([]);
  const [selected, setSelected]         = useState(null);
  const [loadingId, setLoadingId]       = useState(null);
  const [showAdd, setShowAdd]           = useState(false);
  const [resumeText, setResumeText]     = useState("");
  const [editingResume, setEditingResume] = useState(false);
  const [userName, setUserName]         = useState("Your Name");
  const [editingName, setEditingName]   = useState(false);
  const [newJob, setNewJob]             = useState({ company:"", title:"", location:"Remote", salary:"", status:"Saved", url:"", jd:"" });
  const [activeTab, setActiveTab]       = useState("tracker");
  const [filterStatus, setFilterStatus] = useState("All");
  const [error, setError]               = useState(null);

  const selectedJob = jobs.find(j => j.id === selected);
  const hasResume = resumeText.trim().length > 50;

  const stats = {
    total:        jobs.length,
    applied:      jobs.filter(j => j.status === "Applied").length,
    interviewing: jobs.filter(j => j.status === "Interviewing").length,
    offers:       jobs.filter(j => j.status === "Offer").length,
    avgScore:     jobs.length ? Math.round(jobs.reduce((a,j) => a+(j.score||0),0)/jobs.length) : 0,
  };

  async function runAnalysis(job) {
    setLoadingId(job.id);
    setError(null);
    try {
      const prompt = `You are a career coach and ATS expert. Analyze the fit between this resume and job description.

RESUME:
${resumeText}

JOB: ${job.title} at ${job.company}
JD: ${job.jd}

Return ONLY this exact structure with ## headings:

## Match Score
X/100 — [one sentence overall assessment]

## Strong Matches
List 3–4 specific skills or experiences from the resume that directly match the JD.

## Skill Gaps
List 3–4 specific skills/tools/certifications in the JD that are missing or weak in the resume.

## Keywords to Add
List 5–8 exact keywords/phrases from the JD to add to the resume or cover letter. Comma-separated.

## Top Recommendation
One specific, actionable thing to do today to strengthen this application.`;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "Analysis unavailable.";
      const scoreMatch = text.match(/(\d{2,3})\/100/);
      const aiScore = scoreMatch ? parseInt(scoreMatch[1]) : job.score;
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, analysis: text, score: aiScore } : j));
    } catch (e) {
      setError("AI analysis failed: " + e.message);
    }
    setLoadingId(null);
  }

  function addJob() {
    if (!newJob.company || !newJob.title) return;
    const id = Date.now();
    setJobs(prev => [...prev, { ...newJob, id, date: new Date().toISOString().slice(0,10), score: 0, analysis: null }]);
    setNewJob({ company:"", title:"", location:"Remote", salary:"", status:"Saved", url:"", jd:"" });
    setShowAdd(false);
    setSelected(id);
  }

  const filtered = filterStatus === "All" ? jobs : jobs.filter(j => j.status === filterStatus);
  const inputStyle = { width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid #e2e8f0", fontSize:14, color:"#1e293b", background:"#fff", outline:"none", boxSizing:"border-box" };
  const labelStyle = { fontSize:12, fontWeight:600, color:"#64748b", letterSpacing:"0.04em", textTransform:"uppercase", marginBottom:4, display:"block" };

  if (showWelcome) return <WelcomeScreen onStart={() => setShowWelcome(false)} />;

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", background:"#f1f5f9", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .job-row:hover { background:#f0f4ff !important; }
        textarea:focus, input:focus, select:focus { border-color:#6366f1 !important; box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
        .name-edit:hover { background:rgba(255,255,255,0.1) !important; }
      `}</style>

      {/* NAV */}
      <div style={{ background:"#0f172a", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56, position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>📋</div>
          <span style={{ color:"#fff", fontWeight:700, fontSize:17 }}>JobTrack <span style={{ color:"#818cf8" }}>AI</span></span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {["tracker","resume"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ background:activeTab===tab?"#1e293b":"transparent", color:activeTab===tab?"#fff":"#94a3b8", border:"none", borderRadius:6, padding:"6px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              {tab === "tracker" ? "🗂 Tracker" : "📄 My Resume"}
              {tab === "resume" && !hasResume && <span style={{ marginLeft:6, background:"#ef4444", color:"#fff", borderRadius:10, padding:"1px 6px", fontSize:10, fontWeight:700 }}>!</span>}
            </button>
          ))}
        </div>
        {/* Editable name */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {editingName ? (
            <input value={userName} onChange={e => setUserName(e.target.value)}
              onBlur={() => setEditingName(false)} onKeyDown={e => e.key==="Enter" && setEditingName(false)}
              autoFocus style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:6, padding:"4px 10px", color:"#fff", fontSize:13, outline:"none", width:160 }} />
          ) : (
            <button className="name-edit" onClick={() => setEditingName(true)}
              style={{ background:"transparent", border:"none", color:"#94a3b8", fontSize:13, cursor:"pointer", borderRadius:6, padding:"4px 10px", transition:"all 0.15s" }}>
              {userName} ✎
            </button>
          )}
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div style={{ background:"#fef2f2", borderBottom:"1px solid #fecaca", padding:"10px 32px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"#dc2626", fontSize:14 }}>⚠️ {error}</span>
          <button onClick={() => setError(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#dc2626", fontSize:18 }}>✕</button>
        </div>
      )}

      {activeTab === "resume" ? (
        /* RESUME TAB */
        <div style={{ maxWidth:860, margin:"32px auto", padding:"0 24px" }}>
          <div style={{ background:"#fff", borderRadius:16, padding:32, boxShadow:"0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a" }}>Your Resume</h2>
                <p style={{ color:"#64748b", fontSize:14, marginTop:4 }}>Paste your resume text here. The AI uses this for all gap analyses.</p>
              </div>
              <button onClick={() => setEditingResume(!editingResume)}
                style={{ background:editingResume?"#6366f1":"#f1f5f9", color:editingResume?"#fff":"#374151", border:"none", borderRadius:8, padding:"8px 18px", fontWeight:600, fontSize:13, cursor:"pointer", whiteSpace:"nowrap" }}>
                {editingResume ? "✓ Save" : "✏️ Edit"}
              </button>
            </div>

            {!hasResume && (
              <div style={{ background:"#eff6ff", borderRadius:10, padding:"14px 16px", marginBottom:20, border:"1px solid #bfdbfe" }}>
                <p style={{ color:"#1d4ed8", fontSize:13, lineHeight:1.6 }}>
                  👋 <strong>To get started:</strong> Click Edit and paste your resume text. Include your skills, work experience, and projects for the most accurate AI analysis.
                </p>
              </div>
            )}

            {editingResume ? (
              <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
                placeholder={EMPTY_RESUME}
                style={{ ...inputStyle, minHeight:440, fontFamily:"'DM Mono',monospace", fontSize:13, lineHeight:1.7, resize:"vertical" }} />
            ) : resumeText ? (
              <pre style={{ background:"#f8fafc", borderRadius:10, padding:20, fontSize:13, fontFamily:"'DM Mono',monospace", lineHeight:1.7, color:"#334155", whiteSpace:"pre-wrap", wordBreak:"break-word", border:"1px solid #e2e8f0" }}>{resumeText}</pre>
            ) : (
              <div style={{ background:"#f8fafc", borderRadius:10, padding:"40px 20px", textAlign:"center", border:"1px dashed #cbd5e1" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📄</div>
                <p style={{ color:"#94a3b8", fontSize:14, marginBottom:16 }}>No resume added yet.</p>
                <button onClick={() => setEditingResume(true)} style={{ background:"#6366f1", color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", fontWeight:600, fontSize:14, cursor:"pointer" }}>
                  + Paste My Resume
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TRACKER TAB */
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"24px" }}>

          {/* STATS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:24 }}>
            {[
              { label:"Total Jobs",   value:stats.total,         icon:"📋", color:"#6366f1" },
              { label:"Applied",      value:stats.applied,       icon:"📤", color:"#3b82f6" },
              { label:"Interviewing", value:stats.interviewing,  icon:"💬", color:"#7c3aed" },
              { label:"Offers",       value:stats.offers,        icon:"🎉", color:"#10b981" },
              { label:"Avg Match",    value:stats.avgScore+"%",  icon:"🎯", color:"#f59e0b" },
            ].map(s => (
              <div key={s.label} style={{ background:"#fff", borderRadius:12, padding:"16px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", borderTop:`3px solid ${s.color}` }}>
                <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize:26, fontWeight:800, color:"#0f172a", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:12, color:"#64748b", marginTop:4, fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"400px 1fr", gap:20, alignItems:"start" }}>

            {/* JOB LIST */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ ...inputStyle, width:"auto", fontSize:13, padding:"6px 12px" }}>
                  <option>All</option>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={() => setShowAdd(true)}
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontWeight:600, fontSize:13, cursor:"pointer" }}>
                  + Add Job
                </button>
              </div>

              {/* EMPTY STATE */}
              {jobs.length === 0 ? (
                <div style={{ background:"#fff", borderRadius:16, padding:"48px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>🎯</div>
                  <h3 style={{ color:"#0f172a", fontSize:17, fontWeight:700, marginBottom:8 }}>Start tracking your search</h3>
                  <p style={{ color:"#64748b", fontSize:14, marginBottom:24, lineHeight:1.6 }}>Add your first job application and get AI-powered gap analysis to boost your chances.</p>
                  <button onClick={() => setShowAdd(true)} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", borderRadius:8, padding:"12px 28px", fontWeight:600, fontSize:14, cursor:"pointer" }}>
                    + Add Your First Job
                  </button>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {filtered.map(job => (
                    <div key={job.id} className="job-row" onClick={() => setSelected(job.id)}
                      style={{ background:selected===job.id?"#eef2ff":"#fff", border:selected===job.id?"2px solid #6366f1":"2px solid transparent", borderRadius:12, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", animation:"fadeIn 0.2s ease" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>{job.title}</div>
                          <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{job.company} · {job.location}</div>
                        </div>
                        {job.score > 0 && <ScoreBadge score={job.score} />}
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <StatusBadge status={job.status} />
                        <span style={{ fontSize:11, color:"#94a3b8" }}>{job.date}</span>
                      </div>
                      {job.analysis && <div style={{ marginTop:6, fontSize:11, color:"#6366f1", fontWeight:600 }}>✓ Analysis complete</div>}
                    </div>
                  ))}
                  {filtered.length === 0 && jobs.length > 0 && (
                    <div style={{ textAlign:"center", padding:"40px 20px", color:"#94a3b8", fontSize:14 }}>
                      No jobs with status "{filterStatus}".
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DETAIL PANEL */}
            <div>
              {selectedJob ? (
                <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 1px 3px rgba(0,0,0,0.08)", overflow:"hidden", animation:"fadeIn 0.2s ease" }}>
                  <div style={{ background:"linear-gradient(135deg,#0f172a,#1e293b)", padding:"24px 28px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <h2 style={{ color:"#fff", fontSize:20, fontWeight:800 }}>{selectedJob.title}</h2>
                        <div style={{ color:"#94a3b8", fontSize:14, marginTop:4 }}>{selectedJob.company} · {selectedJob.location}</div>
                        {selectedJob.salary && <div style={{ color:"#818cf8", fontSize:13, marginTop:4, fontWeight:600 }}>{selectedJob.salary}</div>}
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        {selectedJob.url && (
                          <a href={selectedJob.url} target="_blank" rel="noopener noreferrer"
                            style={{ background:"rgba(255,255,255,0.1)", color:"#fff", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:600, textDecoration:"none", border:"1px solid rgba(255,255,255,0.15)" }}>
                            Apply →
                          </a>
                        )}
                        <button onClick={() => { setJobs(p => p.filter(j => j.id !== selectedJob.id)); setSelected(null); }}
                          style={{ background:"rgba(255,255,255,0.05)", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"7px 10px", fontSize:13, cursor:"pointer" }}>
                          🗑
                        </button>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6, marginTop:16, flexWrap:"wrap" }}>
                      {STATUSES.map(s => (
                        <button key={s} onClick={() => setJobs(p => p.map(j => j.id===selectedJob.id?{...j,status:s}:j))}
                          style={{ background:selectedJob.status===s?"#6366f1":"rgba(255,255,255,0.08)", color:selectedJob.status===s?"#fff":"#94a3b8", border:"none", borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding:"24px 28px" }}>
                    <div style={{ marginBottom:24 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#6366f1", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>Job Description</div>
                      <div style={{ background:"#f8fafc", borderRadius:10, padding:"14px 16px", fontSize:13, color:"#475569", lineHeight:1.7, border:"1px solid #e2e8f0", maxHeight:120, overflowY:"auto" }}>
                        {selectedJob.jd || <span style={{ color:"#94a3b8", fontStyle:"italic" }}>No JD added.</span>}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:"#6366f1", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12 }}>AI Gap Analysis</div>
                      <AnalysisPanel
                        analysis={selectedJob.analysis}
                        loading={loadingId === selectedJob.id}
                        onRun={() => runAnalysis(selectedJob)}
                        jobTitle={selectedJob.title}
                        company={selectedJob.company}
                        hasResume={hasResume}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background:"#fff", borderRadius:16, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>👈</div>
                  <div style={{ color:"#64748b", fontSize:15 }}>Select a job to see details and run AI analysis.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD JOB MODAL */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:32, width:"100%", maxWidth:540, maxHeight:"90vh", overflowY:"auto", animation:"fadeIn 0.2s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h3 style={{ fontSize:18, fontWeight:800, color:"#0f172a" }}>Add New Job</h3>
              <button onClick={() => setShowAdd(false)} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:16 }}>✕</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                { label:"Company *",    key:"company",  placeholder:"e.g. Azra AI" },
                { label:"Job Title *",  key:"title",    placeholder:"e.g. Product Analyst" },
                { label:"Location",     key:"location", placeholder:"Remote" },
                { label:"Salary Range", key:"salary",   placeholder:"e.g. $90,000–$110,000" },
                { label:"Apply URL",    key:"url",      placeholder:"https://..." },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input value={newJob[f.key]} onChange={e => setNewJob(p=>({...p,[f.key]:e.target.value}))}
                    placeholder={f.placeholder} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Status</label>
                <select value={newJob.status} onChange={e => setNewJob(p=>({...p,status:e.target.value}))} style={inputStyle}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Job Description (paste for AI analysis)</label>
                <textarea value={newJob.jd} onChange={e => setNewJob(p=>({...p,jd:e.target.value}))}
                  placeholder="Paste the full job description here for best AI analysis results..." style={{ ...inputStyle, minHeight:120, resize:"vertical" }} />
              </div>
              <div style={{ display:"flex", gap:10, marginTop:8 }}>
                <button onClick={() => setShowAdd(false)} style={{ flex:1, background:"#f1f5f9", color:"#374151", border:"none", borderRadius:8, padding:10, fontWeight:600, fontSize:14, cursor:"pointer" }}>Cancel</button>
                <button onClick={addJob} disabled={!newJob.company || !newJob.title}
                  style={{ flex:2, background:(!newJob.company||!newJob.title)?"#e2e8f0":"linear-gradient(135deg,#6366f1,#8b5cf6)", color:(!newJob.company||!newJob.title)?"#94a3b8":"#fff", border:"none", borderRadius:8, padding:10, fontWeight:600, fontSize:14, cursor:(!newJob.company||!newJob.title)?"not-allowed":"pointer" }}>
                  Add Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
