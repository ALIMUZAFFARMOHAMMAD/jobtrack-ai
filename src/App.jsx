import { useState, useEffect, useRef } from "react";

const RESUME_TEXT = `Product Manager with 3+ years of cross-functional delivery experience in healthcare IT and AI-driven products. Hands-on fluency with LLMs (GPT-4, Claude), prompt engineering, autonomous agents, AI workflow automation. M.S. Information Systems, Saint Louis University 2025.

SKILLS: PRD Writing, User Stories, Acceptance Criteria, Feature Lifecycle, Product Roadmapping, Backlog Prioritization, Agile/Scrum, Sprint Planning, Figma, JIRA, Confluence, Power BI, Tableau, SQL, Excel Power Query, Stakeholder Alignment, Executive Reporting.

EXPERIENCE:
- Wipro / UnitedHealthcare (Jan 2022–Jul 2023): Drove product delivery for healthcare enterprise platform. Owned backlog in JIRA for 5+ workstreams. Wrote user stories, acceptance criteria, release docs. 95%+ on-time delivery. Aligned 15+ stakeholders across 3 time zones. Cut bottlenecks 30%, decision cycle 25%.
- SSS Solutions (May 2021–Dec 2021): Led discovery for Sales Intelligence Dashboard. Ran stakeholder interviews, UAT with 10+ users, shipped on schedule. Cut delays 20%.

PROJECTS: AI Workflow Automation (GPT-4, Claude APIs, n8n, Zapier), Power BI Sales Dashboard, Hospital Resource Optimization (SQL, Tableau).`;

const SAMPLE_JOBS = [
  {
    id: 1, company: "On Belay Health Solutions", title: "Healthcare Business Analyst",
    location: "Remote", salary: "$95,000–$105,000", status: "Applied",
    date: "2026-06-01", url: "https://to.indeed.com/aajcgns2qlsr",
    jd: "Healthcare Business Analyst role requiring 4+ years healthcare data analytics, strong SQL (required), Advanced Excel, Power BI or Tableau preferred, Python preferred. Must analyze complex healthcare datasets (claims, clinical, operational), write complex SQL queries, develop dashboards, communicate to technical and non-technical stakeholders, create process documentation, perform root cause analysis. Medicare/Medicare Advantage data understanding preferred. Value-based care / ACO exposure a plus.",
    score: 88, analysis: null
  },
  {
    id: 2, company: "TrueLearn", title: "Product Owner, Intelligent Search & Discovery",
    location: "Remote", salary: "$120,000–$140,000", status: "Saved",
    date: "2026-05-29", url: "https://to.indeed.com/aad9qlfg7k8h",
    jd: "Product Owner role for AI-powered search and discovery platform. 3–5 years PO or Technical PM experience. Experience building AI-powered search, semantic search, personalization, adaptive learning. Familiarity with AI/ML concepts. Translate requirements into epics and user stories. Work with engineering, UX, data science. Agile/Scrum, JIRA. CSPO/PSPO certification preferred. EdTech or SaaS background preferred.",
    score: 85, analysis: null
  },
  {
    id: 3, company: "Azra AI", title: "Product Analyst",
    location: "Remote", salary: "$70,000–$80,000", status: "Saved",
    date: "2026-05-12", url: "https://to.indeed.com/aav4wnbssldc",
    jd: "Entry-level Product Analyst at oncology AI healthcare startup. Support senior Product Owner managing multiple applications. Write user stories with acceptance criteria in Jira. Backlog grooming, sprint planning. Gather and synthesize stakeholder feedback. Analyze data from reporting tools. Work with Engineering, Data Science, QA, Analytics. Familiarity with SQL, Power BI, Tableau a plus. Healthcare technology interest preferred. Agile/Scrum exposure preferred.",
    score: 83, analysis: null
  }
];

const STATUS_CONFIG = {
  "Saved":      { color: "#64748b", bg: "#f1f5f9", dot: "#94a3b8" },
  "Applied":    { color: "#2563eb", bg: "#eff6ff", dot: "#3b82f6" },
  "Interviewing": { color: "#7c3aed", bg: "#f5f3ff", dot: "#8b5cf6" },
  "Offer":      { color: "#059669", bg: "#ecfdf5", dot: "#10b981" },
  "Rejected":   { color: "#dc2626", bg: "#fef2f2", dot: "#ef4444" },
};

const STATUSES = Object.keys(STATUS_CONFIG);

function ScoreBadge({ score }) {
  const color = score >= 80 ? "#10b981" : score >= 65 ? "#f59e0b" : "#ef4444";
  const bg = score >= 80 ? "#ecfdf5" : score >= 65 ? "#fffbeb" : "#fef2f2";
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:4, background:bg, color, borderRadius:20, padding:"2px 10px", fontWeight:700, fontSize:13, letterSpacing:"0.02em" }}>
      <span style={{ fontSize:10 }}>●</span> {score}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Saved"];
  return (
    <span style={{ background:cfg.bg, color:cfg.color, borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:600, letterSpacing:"0.03em" }}>
      {status}
    </span>
  );
}

function AnalysisPanel({ analysis, loading, onRun, jobTitle, company }) {
  if (loading) return (
    <div style={{ padding:"32px 0", textAlign:"center" }}>
      <div style={{ display:"inline-block", width:28, height:28, border:"3px solid #e2e8f0", borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{ marginTop:12, color:"#64748b", fontSize:14 }}>Analyzing gap between your resume and this role...</p>
    </div>
  );

  if (!analysis) return (
    <div style={{ padding:"24px", textAlign:"center", background:"#f8fafc", borderRadius:12, border:"1px dashed #cbd5e1" }}>
      <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
      <p style={{ color:"#64748b", fontSize:14, marginBottom:16, lineHeight:1.6 }}>
        Run an AI gap analysis to see exactly which skills to emphasize and what's missing for <strong>{jobTitle}</strong> at <strong>{company}</strong>.
      </p>
      <button onClick={onRun} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", fontWeight:600, fontSize:14, cursor:"pointer", letterSpacing:"0.02em" }}>
        ✨ Run Gap Analysis
      </button>
    </div>
  );

  // Parse structured output
  const sections = analysis.split(/\n(?=##)/).filter(Boolean);

  return (
    <div style={{ fontSize:14, lineHeight:1.7, color:"#1e293b" }}>
      {sections.map((section, i) => {
        const lines = section.trim().split("\n");
        const heading = lines[0].replace(/^#+\s*/, "");
        const body = lines.slice(1).join("\n").trim();
        const icons = { "Match Score":"🎯", "Strong Matches":"✅", "Skill Gaps":"⚠️", "Keywords to Add":"🏷️", "Top Recommendation":"💡" };
        const icon = Object.entries(icons).find(([k]) => heading.includes(k))?.[1] || "📌";
        return (
          <div key={i} style={{ marginBottom:20, background: i===0?"linear-gradient(135deg,#f0fdf4,#dcfce7)": i===sections.length-1?"linear-gradient(135deg,#fef9c3,#fef08a20)":"#f8fafc", borderRadius:10, padding:"14px 16px", border:`1px solid ${i===0?"#bbf7d0":i===sections.length-1?"#fde68a":"#e2e8f0"}` }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:6, color:"#0f172a", letterSpacing:"0.02em" }}>{icon} {heading}</div>
            <div style={{ color:"#334155", fontSize:13.5, whiteSpace:"pre-wrap" }}>{body}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [selected, setSelected] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [resumeText, setResumeText] = useState(RESUME_TEXT);
  const [editingResume, setEditingResume] = useState(false);
  const [newJob, setNewJob] = useState({ company:"", title:"", location:"Remote", salary:"", status:"Saved", url:"", jd:"" });
  const [activeTab, setActiveTab] = useState("tracker"); // tracker | resume
  const [filterStatus, setFilterStatus] = useState("All");

  const selectedJob = jobs.find(j => j.id === selected);

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === "Applied").length,
    interviewing: jobs.filter(j => j.status === "Interviewing").length,
    offers: jobs.filter(j => j.status === "Offer").length,
    avgScore: jobs.length ? Math.round(jobs.reduce((a,j) => a + (j.score||0), 0) / jobs.length) : 0,
  };

  async function runAnalysis(job) {
    setLoadingId(job.id);
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
List 3–4 specific skills or experiences from the resume that directly match the JD. Be specific and concise.

## Skill Gaps
List 3–4 specific skills/tools/certifications in the JD that are missing or weak in the resume. Be honest.

## Keywords to Add
List 5–8 exact keywords/phrases from the JD that should appear in the resume or cover letter. Comma-separated.

## Top Recommendation
One specific, actionable thing to do today to strengthen this application. Be concrete and direct.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "Analysis unavailable.";

      // Extract score from analysis
      const scoreMatch = text.match(/(\d{2,3})\/100/);
      const aiScore = scoreMatch ? parseInt(scoreMatch[1]) : job.score;

      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, analysis: text, score: aiScore } : j));
    } catch (e) {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, analysis: "## Error\nCould not reach AI. Check your API connection." } : j));
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

  function updateStatus(id, status) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  }

  function deleteJob(id) {
    setJobs(prev => prev.filter(j => j.id !== id));
    if (selected === id) setSelected(null);
  }

  const filtered = filterStatus === "All" ? jobs : jobs.filter(j => j.status === filterStatus);

  const inputStyle = { width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid #e2e8f0", fontSize:14, color:"#1e293b", background:"#fff", outline:"none", boxSizing:"border-box" };
  const labelStyle = { fontSize:12, fontWeight:600, color:"#64748b", letterSpacing:"0.04em", textTransform:"uppercase", marginBottom:4, display:"block" };

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", background:"#f1f5f9", minHeight:"100vh", padding:0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .job-row:hover { background: #f0f4ff !important; }
        .btn-ghost:hover { background: #f1f5f9 !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius:3px; }
        textarea:focus, input:focus, select:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
      `}</style>

      {/* TOP NAV */}
      <div style={{ background:"#0f172a", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>📋</div>
          <span style={{ color:"#fff", fontWeight:700, fontSize:16, letterSpacing:"-0.02em" }}>JobTrack <span style={{ color:"#818cf8" }}>AI</span></span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {["tracker","resume"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab===tab ? "#1e293b" : "transparent", color: activeTab===tab ? "#fff" : "#94a3b8", border:"none", borderRadius:6, padding:"6px 16px", fontSize:13, fontWeight:600, cursor:"pointer", textTransform:"capitalize", letterSpacing:"0.02em" }}>
              {tab === "tracker" ? "🗂 Tracker" : "📄 My Resume"}
            </button>
          ))}
        </div>
        <div style={{ color:"#475569", fontSize:13 }}>Muzaffar Ali Mohammad</div>
      </div>

      {activeTab === "resume" ? (
        /* RESUME TAB */
        <div style={{ maxWidth:860, margin:"32px auto", padding:"0 24px" }}>
          <div style={{ background:"#fff", borderRadius:16, padding:32, boxShadow:"0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:"#0f172a" }}>Your Resume Context</h2>
                <p style={{ margin:"4px 0 0", color:"#64748b", fontSize:14 }}>This text is used for all AI gap analyses. Keep it current.</p>
              </div>
              <button onClick={() => setEditingResume(!editingResume)} style={{ background: editingResume?"#6366f1":"#f1f5f9", color: editingResume?"#fff":"#374151", border:"none", borderRadius:8, padding:"8px 18px", fontWeight:600, fontSize:13, cursor:"pointer" }}>
                {editingResume ? "✓ Save" : "✏️ Edit"}
              </button>
            </div>
            {editingResume ? (
              <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
                style={{ ...inputStyle, minHeight:400, fontFamily:"'DM Mono', monospace", fontSize:13, lineHeight:1.7, resize:"vertical" }} />
            ) : (
              <pre style={{ background:"#f8fafc", borderRadius:10, padding:20, fontSize:13, fontFamily:"'DM Mono', monospace", lineHeight:1.7, color:"#334155", whiteSpace:"pre-wrap", wordBreak:"break-word", border:"1px solid #e2e8f0", margin:0 }}>{resumeText}</pre>
            )}
          </div>
        </div>
      ) : (
        /* TRACKER TAB */
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"24px 24px" }}>

          {/* STAT CARDS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:24 }}>
            {[
              { label:"Total Jobs", value: stats.total, icon:"📋", color:"#6366f1" },
              { label:"Applied", value: stats.applied, icon:"📤", color:"#3b82f6" },
              { label:"Interviewing", value: stats.interviewing, icon:"💬", color:"#7c3aed" },
              { label:"Offers", value: stats.offers, icon:"🎉", color:"#10b981" },
              { label:"Avg Match", value: stats.avgScore + "%", icon:"🎯", color:"#f59e0b" },
            ].map(s => (
              <div key={s.label} style={{ background:"#fff", borderRadius:12, padding:"16px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", borderTop:`3px solid ${s.color}` }}>
                <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize:26, fontWeight:800, color:"#0f172a", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:12, color:"#64748b", marginTop:4, fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"400px 1fr", gap:20, alignItems:"start" }}>

            {/* LEFT — JOB LIST */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ ...inputStyle, width:"auto", fontSize:13, padding:"6px 12px" }}>
                  <option>All</option>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={() => setShowAdd(true)} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontWeight:600, fontSize:13, cursor:"pointer", whiteSpace:"nowrap" }}>
                  + Add Job
                </button>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {filtered.map(job => (
                  <div key={job.id} className="job-row" onClick={() => setSelected(job.id)}
                    style={{ background: selected===job.id ? "#eef2ff":"#fff", border: selected===job.id?"2px solid #6366f1":"2px solid transparent", borderRadius:12, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", animation:"fadeIn 0.2s ease" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:"#0f172a", lineHeight:1.3 }}>{job.title}</div>
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
                {filtered.length === 0 && (
                  <div style={{ textAlign:"center", padding:"40px 20px", color:"#94a3b8", fontSize:14 }}>
                    No jobs with status "{filterStatus}" yet.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — DETAIL PANEL */}
            <div>
              {selectedJob ? (
                <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 1px 3px rgba(0,0,0,0.08)", overflow:"hidden", animation:"fadeIn 0.2s ease" }}>
                  {/* Job header */}
                  <div style={{ background:"linear-gradient(135deg,#0f172a,#1e293b)", padding:"24px 28px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <h2 style={{ margin:0, color:"#fff", fontSize:20, fontWeight:800, letterSpacing:"-0.02em" }}>{selectedJob.title}</h2>
                        <div style={{ color:"#94a3b8", fontSize:14, marginTop:4 }}>{selectedJob.company} · {selectedJob.location}</div>
                        {selectedJob.salary && <div style={{ color:"#818cf8", fontSize:13, marginTop:4, fontWeight:600 }}>{selectedJob.salary}</div>}
                      </div>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        {selectedJob.url && (
                          <a href={selectedJob.url} target="_blank" rel="noopener noreferrer"
                            style={{ background:"rgba(255,255,255,0.1)", color:"#fff", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:600, textDecoration:"none", border:"1px solid rgba(255,255,255,0.15)" }}>
                            Apply →
                          </a>
                        )}
                        <button onClick={() => deleteJob(selectedJob.id)} className="btn-ghost"
                          style={{ background:"rgba(255,255,255,0.05)", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"7px 10px", fontSize:13, cursor:"pointer" }}>
                          🗑
                        </button>
                      </div>
                    </div>
                    {/* Status selector */}
                    <div style={{ display:"flex", gap:6, marginTop:16, flexWrap:"wrap" }}>
                      {STATUSES.map(s => (
                        <button key={s} onClick={() => updateStatus(selectedJob.id, s)}
                          style={{ background: selectedJob.status===s?"#6366f1":"rgba(255,255,255,0.08)", color: selectedJob.status===s?"#fff":"#94a3b8", border:"none", borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding:"24px 28px" }}>
                    {/* JD */}
                    <div style={{ marginBottom:24 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#6366f1", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>Job Description</div>
                      <div style={{ background:"#f8fafc", borderRadius:10, padding:"14px 16px", fontSize:13, color:"#475569", lineHeight:1.7, border:"1px solid #e2e8f0", maxHeight:140, overflowY:"auto" }}>
                        {selectedJob.jd || <span style={{ color:"#94a3b8", fontStyle:"italic" }}>No JD added yet.</span>}
                      </div>
                    </div>

                    {/* AI ANALYSIS */}
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:"#6366f1", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12 }}>AI Gap Analysis</div>
                      <AnalysisPanel
                        analysis={selectedJob.analysis}
                        loading={loadingId === selectedJob.id}
                        onRun={() => runAnalysis(selectedJob)}
                        jobTitle={selectedJob.title}
                        company={selectedJob.company}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background:"#fff", borderRadius:16, padding:"60px 32px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>👈</div>
                  <div style={{ color:"#64748b", fontSize:15 }}>Select a job from the list to see details and run AI analysis.</div>
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
              <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:"#0f172a" }}>Add New Job</h3>
              <button onClick={() => setShowAdd(false)} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:16 }}>✕</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                { label:"Company *", key:"company", placeholder:"e.g. Azra AI" },
                { label:"Job Title *", key:"title", placeholder:"e.g. Product Analyst" },
                { label:"Location", key:"location", placeholder:"Remote" },
                { label:"Salary Range", key:"salary", placeholder:"e.g. $90,000–$110,000" },
                { label:"Apply URL", key:"url", placeholder:"https://..." },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input value={newJob[f.key]} onChange={e => setNewJob(p => ({...p, [f.key]:e.target.value}))}
                    placeholder={f.placeholder} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Status</label>
                <select value={newJob.status} onChange={e => setNewJob(p => ({...p, status:e.target.value}))} style={inputStyle}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Job Description (paste for AI analysis)</label>
                <textarea value={newJob.jd} onChange={e => setNewJob(p => ({...p, jd:e.target.value}))}
                  placeholder="Paste the full job description here..." style={{ ...inputStyle, minHeight:120, resize:"vertical" }} />
              </div>
              <div style={{ display:"flex", gap:10, marginTop:8 }}>
                <button onClick={() => setShowAdd(false)} style={{ flex:1, background:"#f1f5f9", color:"#374151", border:"none", borderRadius:8, padding:"10px", fontWeight:600, fontSize:14, cursor:"pointer" }}>Cancel</button>
                <button onClick={addJob} style={{ flex:2, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", borderRadius:8, padding:"10px", fontWeight:600, fontSize:14, cursor:"pointer" }}>Add Job</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
