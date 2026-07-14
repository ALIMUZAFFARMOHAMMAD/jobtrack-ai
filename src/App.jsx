import { useState, useRef, useEffect } from "react";
import ResumeTailor from "./ResumeTailor.jsx";
import { loadJSON, saveJSON, removeJSON } from "./lib/storage.js";

const EMAILJS_SERVICE_ID = "service_qsuw8tv";
const EMAILJS_TEMPLATE_ID = "template_q5ct06w";
const EMAILJS_PUBLIC_KEY = "FbOs_YvmwcqFDZrID";

const STATUS_CONFIG = {
  "Saved":        { color: "#64748b", bg: "#f1f5f9" },
  "Applied":      { color: "#2563eb", bg: "#eff6ff" },
  "Interviewing": { color: "#7c3aed", bg: "#f5f3ff" },
  "Offer":        { color: "#059669", bg: "#ecfdf5" },
  "Rejected":     { color: "#dc2626", bg: "#fef2f2" },
};
const STATUSES = Object.keys(STATUS_CONFIG);

const JOB_BOARDS = [
  { name: "Indeed",    icon: "🔵", url: "https://www.indeed.com/jobs?q=product+manager&l=remote" },
  { name: "LinkedIn",  icon: "💼", url: "https://www.linkedin.com/jobs/search/?keywords=product+manager&location=Remote" },
  { name: "Glassdoor", icon: "🟢", url: "https://www.glassdoor.com/Job/remote-product-manager-jobs-SRCH_IL.0,6_IS11047_KO7,22.htm" },
  { name: "Dice",      icon: "🎲", url: "https://www.dice.com/jobs?q=product+manager&location=Remote" },
  { name: "Wellfound", icon: "🚀", url: "https://wellfound.com/jobs?role=product-manager" },
];

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp, name) {
  await window.emailjs.send(
    EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID,
    { to_email: email, to_name: name || email.split("@")[0], otp },
    EMAILJS_PUBLIC_KEY
  );
}

function ScoreBadge({ score }) {
  const color = score >= 80 ? "#10b981" : score >= 65 ? "#f59e0b" : "#ef4444";
  const bg    = score >= 80 ? "#ecfdf5" : score >= 65 ? "#fffbeb" : "#fef2f2";
  const label = score>=80?"Strong":score>=65?"Good":"Weak";
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:bg, color, borderRadius:20, padding:"3px 12px", fontWeight:700, fontSize:12 }}>
      <span style={{ fontSize:8 }}>●</span> {score} <span style={{fontSize:10,opacity:0.75}}>{label}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Saved"];
  return <span style={{ background:cfg.bg, color:cfg.color, borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:600 }}>{status}</span>;
}

function AnalysisPanel({ analysis, loading, onRun, jobTitle, company, hasResume }) {
  if (!hasResume) return (
    <div style={{ padding:"24px", textAlign:"center", background:"#fffbeb", borderRadius:12, border:"1px dashed #fde68a" }}>
      <div style={{ fontSize:32, marginBottom:8 }}>📄</div>
      <p style={{ color:"#92400e", fontSize:14, lineHeight:1.6 }}>Upload or paste your resume in <strong>My Resume</strong> tab first.</p>
    </div>
  );
  if (loading) return (
    <div style={{ padding:"32px 0", textAlign:"center" }}>
      <div style={{ position:"relative", width:44, height:44, margin:"0 auto 12px" }}><div style={{ position:"absolute", inset:0, border:"3px solid #e2e8f0", borderRadius:"50%" }}/><div style={{ position:"absolute", inset:0, border:"3px solid transparent", borderTopColor:"#6366f1", borderRightColor:"#8b5cf6", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/><div style={{ position:"absolute", inset:8, border:"2px solid transparent", borderTopColor:"#a78bfa", borderRadius:"50%", animation:"spin 0.4s linear infinite reverse" }}/></div>
      <p style={{ marginTop:12, color:"#64748b", fontSize:14 }}>Analyzing your fit for this role...</p>
    </div>
  );
  if (!analysis) return (
    <div style={{ padding:"24px", textAlign:"center", background:"#f8fafc", borderRadius:12, border:"1px dashed #cbd5e1" }}>
      <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
      <p style={{ color:"#64748b", fontSize:14, marginBottom:16, lineHeight:1.6 }}>Run AI gap analysis for <strong>{jobTitle}</strong> at <strong>{company}</strong>.</p>
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
        const isFirst = i===0, isLast = i===sections.length-1;
        return (
          <div key={i} style={{ marginBottom:16, background:isFirst?"linear-gradient(135deg,#f0fdf4,#dcfce7)":isLast?"#fffbeb":"#f8fafc", borderRadius:10, padding:"14px 16px", border:`1px solid ${isFirst?"#bbf7d0":isLast?"#fde68a":"#e2e8f0"}` }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:6, color:"#0f172a" }}>{icon} {heading}</div>
            <div style={{ color:"#334155", fontSize:13.5, whiteSpace:"pre-wrap" }}>{body}</div>
          </div>
        );
      })}
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [step, setStep]           = useState("signup");
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState("");
  const [otpInput, setOtpInput]   = useState(["","","","","",""]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  // Lazy init avoids a synchronous setState inside the effect (react-hooks/set-state-in-effect).
  const [emailjsReady, setEmailjsReady] = useState(
    () => typeof window !== "undefined" && !!window.emailjs
  );
  const inputRefs = useRef([]);
  const timerRef  = useRef(null);

  useEffect(() => {
    if (window.emailjs) return; // already available; state is already true from lazy init
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => { window.emailjs.init(EMAILJS_PUBLIC_KEY); setEmailjsReady(true); };
    script.onerror = () => setError("Couldn't load the email service. Check your connection and reload the page.");
    document.head.appendChild(script);
  }, []);

  function startResendTimer() {
    setResendTimer(60);
    timerRef.current = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
  }

  async function handleSendOTP(e) {
    e.preventDefault();
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }
    if (!emailjsReady) { setError("Email service loading, please try again."); return; }
    setLoading(true); setError("");
    try {
      const code = generateOTP();
      setOtp(code);
      await sendOTPEmail(email, code, name);
      setStep("otp");
      startResendTimer();
    } catch(err) {
      setError("Failed to send OTP. Check your EmailJS settings.");
      console.error(err);
    }
    setLoading(false);
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    setLoading(true); setError("");
    try {
      const code = generateOTP();
      setOtp(code);
      await sendOTPEmail(email, code, name);
      startResendTimer();
      setOtpInput(["","","","","",""]);
    } catch { setError("Failed to resend OTP."); }
    setLoading(false);
  }

  function handleOtpChange(val, idx) {
    const cleaned = val.replace(/\D/g, "").slice(-1);
    const next = [...otpInput];
    next[idx] = cleaned;
    setOtpInput(next);
    if (cleaned && idx < 5) inputRefs.current[idx+1]?.focus();
    if (next.every(d => d !== "")) verifyOTP(next.join(""));
  }

  function handleOtpKeyDown(e, idx) {
    if (e.key === "Backspace" && !otpInput[idx] && idx > 0) inputRefs.current[idx-1]?.focus();
  }

  function verifyOTP(entered) {
    if (entered === otp) {
      onAuth({ name: name || email.split("@")[0], email });
    } else if (entered.length === 6) {
      setError("Incorrect code. Please try again.");
      setOtpInput(["","","","","",""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }

  const iStyle = { width:"100%", padding:"10px 14px", borderRadius:8, border:"1px solid #e2e8f0", fontSize:15, color:"#1e293b", background:"#fff", outline:"none" };
  const lStyle = { fontSize:12, fontWeight:700, color:"#64748b", letterSpacing:"0.04em", textTransform:"uppercase", marginBottom:6, display:"block" };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        input:focus { border-color:#6366f1 !important; box-shadow:0 0 0 3px rgba(99,102,241,0.15) !important; }
      `}</style>
      <div style={{ width:"100%", maxWidth:420, animation:"fadeIn 0.5s ease" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ width:52, height:52, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, margin:"0 auto 16px" }}>📋</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:22, color:"#fff" }}>JobTrack <span style={{ color:"#818cf8" }}>AI</span></div>
          <div style={{ color:"#64748b", fontSize:14, marginTop:4 }}>Your AI-powered job search companion</div>
        </div>
        <div style={{ background:"#fff", borderRadius:20, padding:"36px 32px", boxShadow:"0 24px 64px rgba(0,0,0,0.4)" }}>
        {step === "signup" ? (
            <>
              <h2 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:22, fontWeight:800, color:"#0f172a", marginBottom:6 }}>Get started free</h2>
              <p style={{ color:"#64748b", fontSize:14, marginBottom:28 }}>Enter your details to receive a verification code.</p>
              <form onSubmit={handleSendOTP} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div>
                  <label style={lStyle}>Your Name</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Muzaffar Ali" style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Email Address *</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required style={iStyle} />
                </div>
                {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 14px", color:"#dc2626", fontSize:13 }}>⚠️ {error}</div>}
                <button type="submit" disabled={loading||!email}
                  style={{ background:loading||!email?"#e2e8f0":"linear-gradient(135deg,#6366f1,#8b5cf6)", color:loading||!email?"#94a3b8":"#fff", border:"none", borderRadius:10, padding:"13px", fontWeight:700, fontSize:15, cursor:loading||!email?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:4 }}>
                  {loading ? <><span style={{ display:"inline-block", width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.6s linear infinite" }}/> Sending...</> : "Send Verification Code →"}
                </button>
              </form>
              <p style={{ textAlign:"center", color:"#94a3b8", fontSize:12, marginTop:20, lineHeight:1.5 }}>By continuing you agree to use JobTrack AI responsibly. No spam, ever.</p>
            </>
          ) : (
            <>
              <button onClick={()=>{ setStep("signup"); setError(""); setOtpInput(["","","","","",""]); }} style={{ background:"none", border:"none", color:"#6366f1", fontSize:13, fontWeight:600, cursor:"pointer", marginBottom:20, padding:0, display:"flex", alignItems:"center", gap:4 }}>← Back</button>
              <h2 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:22, fontWeight:800, color:"#0f172a", marginBottom:6 }}>Check your inbox</h2>
              <p style={{ color:"#64748b", fontSize:14, marginBottom:8 }}>We sent a 6-digit code to</p>
              <p style={{ color:"#6366f1", fontWeight:700, fontSize:15, marginBottom:28 }}>{email}</p>
              <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:24 }}>
                {otpInput.map((digit, idx) => (
                  <input key={idx} ref={el => inputRefs.current[idx] = el} value={digit}
                    onChange={e => handleOtpChange(e.target.value, idx)}
                    onKeyDown={e => handleOtpKeyDown(e, idx)}
                    maxLength={1} inputMode="numeric" autoFocus={idx===0}
                    style={{ width:46, height:54, textAlign:"center", fontSize:22, fontWeight:700, borderRadius:10,
                      border:digit?"2px solid #6366f1":"1px solid #e2e8f0",
                      background:digit?"#eef2ff":"#fff", color:"#0f172a", outline:"none",
                      transition:"all 0.15s", boxShadow:digit?"0 0 0 3px rgba(99,102,241,0.15)":"none" }} />
                ))}
              </div>
              {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 14px", color:"#dc2626", fontSize:13, marginBottom:16 }}>⚠️ {error}</div>}
              <div style={{ textAlign:"center", marginBottom:20 }}>
                {resendTimer > 0
                  ? <p style={{ color:"#94a3b8", fontSize:13 }}>Resend code in <strong style={{ color:"#6366f1" }}>{resendTimer}s</strong></p>
                  : <button onClick={handleResend} disabled={loading} style={{ background:"none", border:"none", color:"#6366f1", fontSize:13, fontWeight:600, cursor:"pointer" }}>{loading?"Sending...":"Resend verification code"}</button>
                }
              </div>
              <p style={{ textAlign:"center", color:"#94a3b8", fontSize:12, lineHeight:1.5 }}>Enter the 6-digit code to verify your email and access JobTrack AI.</p>
            </>
          )}
        </div>
        <p style={{ textAlign:"center", color:"#334155", fontSize:12, marginTop:20 }}>Free to use · Powered by Claude AI · No spam</p>
      </div>
    </div>
  );
}

async function extractTextFromPDF(file) {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    const { default: workerSrc } = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return text.trim() || null;
  } catch { return null; }
}

async function extractTextFromDOCX(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const { default: JSZip } = await import("jszip");
        const zip = await JSZip.loadAsync(e.target.result);
        const xml = await zip.file('word/document.xml')?.async('string');
        if (!xml) throw new Error('No document.xml');
        const text = xml.replace(/<w:br\/>/g,'\n').replace(/<w:p /g,'\n').replace(/<[^>]+>/g,'')
          .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\n{3,}/g,'\n\n').trim();
        resolve(text || null);
      } catch { resolve(null); }
    };
    reader.readAsArrayBuffer(file);
  });
}

function buildPrompt(resume, title, company, jd) {
  const parts = [
    'You are a career coach and ATS expert. Analyze the fit between this resume and job description.',
    '', 'RESUME:', resume, '',
    'JOB: ' + title + ' at ' + company,
    'JD: ' + jd, '',
    'Return ONLY this exact structure with ## headings:', '',
    '## Match Score', 'X out of 100 with one sentence assessment.', '',
    '## Strong Matches', 'List 3-4 skills from resume matching JD.', '',
    '## Skill Gaps', 'List 3-4 skills in JD missing from resume.', '',
    '## Keywords to Add', 'List 5-8 exact JD keywords. Comma-separated.', '',
    '## Top Recommendation', 'One actionable thing to do today.'
  ];
  return parts.join('\n');
}

export default function App() {
  const [user, setUser]                   = useState(() => loadJSON("user", null));
  const [jobs, setJobs]                   = useState(() => loadJSON("jobs", []));
  const [selected, setSelected]           = useState(null);
  const [loadingId, setLoadingId]         = useState(null);
  const [showAdd, setShowAdd]             = useState(false);
  const [resumeText, setResumeText]       = useState(() => loadJSON("resumeText", ""));
  const [editingResume, setEditingResume] = useState(false);
  const [resumeFileName, setResumeFileName] = useState(() => loadJSON("resumeFileName", null));
  const [uploadingResume, setUploadingResume] = useState(false);
  const [editingName, setEditingName]     = useState(false);
  const [newJob, setNewJob]               = useState({ company:"", title:"", location:"Remote", salary:"", status:"Saved", url:"", source:"", jd:"" });
  const [activeTab, setActiveTab]         = useState("tracker");
  const [tailorSeed, setTailorSeed]       = useState(null);
  const [filterStatus, setFilterStatus]   = useState("All");
  const [searchQuery, setSearchQuery]     = useState("");
  const [error, setError]                 = useState(null);
  const fileInputRef                      = useRef(null);

  useEffect(() => { saveJSON("jobs", jobs); }, [jobs]);
  useEffect(() => { if (user) saveJSON("user", user); else removeJSON("user"); }, [user]);
  useEffect(() => { if (resumeText) saveJSON("resumeText", resumeText); else removeJSON("resumeText"); }, [resumeText]);
  useEffect(() => { if (resumeFileName) saveJSON("resumeFileName", resumeFileName); else removeJSON("resumeFileName"); }, [resumeFileName]);

  const selectedJob = jobs.find(j => j.id === selected);
  const hasResume   = resumeText.trim().length > 50;

  const stats = {
    total:        jobs.length,
    applied:      jobs.filter(j=>j.status==="Applied").length,
    interviewing: jobs.filter(j=>j.status==="Interviewing").length,
    offers:       jobs.filter(j=>j.status==="Offer").length,
    avgScore:     jobs.length ? Math.round(jobs.reduce((a,j)=>a+(j.score||0),0)/jobs.length) : 0,
  };

  async function handleResumeUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true); setError(null);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      let text = "";
      if (ext==="pdf") text = await extractTextFromPDF(file);
      else if (ext==="docx") text = await extractTextFromDOCX(file);
      else if (ext==="txt") text = await file.text();
      else { setError("Unsupported file. Upload PDF, DOCX, or TXT."); setUploadingResume(false); return; }
      if (!text) { setError(`Couldn't read ${file.name} — please paste your resume text below instead.`); setUploadingResume(false); return; }
      setResumeText(text); setResumeFileName(file.name); setEditingResume(false);
    } catch(err) { setError("Failed to read file: " + err.message); }
    setUploadingResume(false);
  }

  async function runAnalysis(job) {
    setLoadingId(job.id); setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-5", max_tokens:1000,
          messages:[{ role:"user", content:buildPrompt(resumeText, job.title, job.company, job.jd) }]
        })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error||`HTTP ${res.status}`); }
      const data = await res.json();
      const text = data.content?.find(b=>b.type==="text")?.text || "Analysis unavailable.";
      const scoreMatch = text.match(/(\d{1,3})[/]100/) || text.match(/score[:\s]+(\d{1,3})/i);
      setJobs(prev=>prev.map(j=>j.id===job.id?{...j,analysis:text,score:scoreMatch?parseInt(scoreMatch[1]):job.score}:j));
    } catch(e) { setError("AI analysis failed: "+e.message); }
    setLoadingId(null);
  }



  function downloadCSV() {
    if (!jobs.length) return;
    const h = ['Title','Company','Location','Salary','Status','Score','Date','Source','URL'];
    const rows = jobs.map(j=>[j.title||'',j.company||'',j.location||'',j.salary||'',j.status||'',j.score||0,j.date||'',j.source||'',j.url||'']);
    const csv = [h,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'jobtrack-pipeline.csv';
    a.click();
  }

  function addJob() {
    if (!newJob.company||!newJob.title) return;
    const id = Date.now();
    setJobs(prev=>[...prev,{...newJob,id,date:new Date().toISOString().slice(0,10),score:0,analysis:null}]);
    setNewJob({company:"",title:"",location:"Remote",salary:"",status:"Saved",url:"",source:"",jd:""});
    setShowAdd(false); setSelected(id);
  }

  if (!user) return <AuthScreen onAuth={u => setUser(u)} />;

  const q = searchQuery.trim().toLowerCase();
  const filtered = (filterStatus==="All"?jobs:jobs.filter(j=>j.status===filterStatus))
    .filter(j=>!q||j.title?.toLowerCase().includes(q)||j.company?.toLowerCase().includes(q))
    .slice().sort((a,b)=>(b.score||0)-(a.score||0));
  const inputStyle = {width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:14,color:"#1e293b",background:"#fff",outline:"none",boxSizing:"border-box"};
  const labelStyle = {fontSize:12,fontWeight:600,color:"#64748b",letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:4,display:"block"};

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", background:"#f1f5f9", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeInLeft { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        @keyframes scoreReveal { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
        .job-row { transition:all 0.2s ease !important; }
        .job-row:hover { background:#f0f4ff !important; transform:translateX(3px); box-shadow:0 4px 12px rgba(99,102,241,0.1) !important; }
        .board-btn { transition:all 0.2s ease !important; }
        .board-btn:hover { transform:translateY(-4px); box-shadow:0 8px 20px rgba(0,0,0,0.12) !important; }
        .stat-card { transition:all 0.2s ease !important; }
        .stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(0,0,0,0.08) !important; }
        textarea:focus, input:focus, select:focus { border-color:#6366f1 !important; box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
        .upload-zone:hover { border-color:#6366f1 !important; background:#f5f3ff !important; }
      `}</style>

      <div style={{ background:"#0f172a", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56, position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#lg1)"/><rect x="8" y="9" width="16" height="2.5" rx="1.25" fill="white" opacity="0.9"/><rect x="8" y="14.5" width="11" height="2.5" rx="1.25" fill="white" opacity="0.7"/><rect x="8" y="20" width="13" height="2.5" rx="1.25" fill="white" opacity="0.7"/><circle cx="24" cy="22" r="5" fill="#10b981"/><path d="M21.5 22l1.5 1.5 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ color:"#fff", fontWeight:800, fontSize:17 }}>JobTrack <span style={{ color:"#818cf8" }}>AI</span></span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {[{id:"tracker",label:"🗂 Tracker"},{id:"boards",label:"🔍 Job Boards"},{id:"resume",label:"📄 My Resume"},{id:"tailor",label:"✨ Tailor Resume"}].map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              style={{ background:activeTab===tab.id?"#1e293b":"transparent", color:activeTab===tab.id?"#fff":"#94a3b8", border:"none", borderRadius:6, padding:"6px 16px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              {tab.label}
              {tab.id==="resume"&&!hasResume&&<span style={{ marginLeft:5,background:"#ef4444",color:"#fff",borderRadius:10,padding:"1px 5px",fontSize:9,fontWeight:700,verticalAlign:"middle" }}>!</span>}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", fontWeight:700 }}>
              {user.name?.[0]?.toUpperCase()||"U"}
            </div>
            {editingName
              ? <input value={user.name} onChange={e=>setUser(u=>({...u,name:e.target.value}))} onBlur={()=>setEditingName(false)} onKeyDown={e=>e.key==="Enter"&&setEditingName(false)} autoFocus style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:6, padding:"4px 10px", color:"#fff", fontSize:13, outline:"none", width:140 }} />
              : <button onClick={()=>setEditingName(true)} style={{ background:"transparent", border:"none", color:"#94a3b8", fontSize:13, cursor:"pointer", borderRadius:6, padding:"4px 8px" }}>{user.name} ✎</button>
            }
          </div>
          <button onClick={()=>setUser(null)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8", borderRadius:6, padding:"5px 12px", fontSize:12, cursor:"pointer", fontWeight:600 }}>Sign Out</button>
        </div>
      </div>

      {error && (
        <div style={{ background:"#fef2f2", borderBottom:"1px solid #fecaca", padding:"10px 32px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"#dc2626", fontSize:14 }}>⚠️ {error}</span>
          <button onClick={()=>setError(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#dc2626", fontSize:18 }}>✕</button>
        </div>
      )}
      {activeTab==="tailor" && (
        <div style={{ maxWidth:900, margin:"32px auto", padding:"0 24px" }}>
          <ResumeTailor
            key={tailorSeed ? `${tailorSeed.title}-${tailorSeed.company}` : "default"}
            resumeText={resumeText}
            initialJd={tailorSeed?.jd}
            jobContext={tailorSeed}
          />
        </div>
      )}
      {activeTab==="boards" && (
        <div style={{ maxWidth:900, margin:"32px auto", padding:"0 24px" }}>
          <div style={{ background:"#fff", borderRadius:16, padding:32, boxShadow:"0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", marginBottom:6 }}>Job Board Search</h2>
            <p style={{ color:"#64748b", fontSize:14, marginBottom:28 }}>Open any platform, find a job, copy the JD, and add it to your tracker.</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:36 }}>
              {JOB_BOARDS.map(board=>(
                <a key={board.name} href={board.url} target="_blank" rel="noopener noreferrer" className="board-btn"
                  style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, background:"#f8fafc", borderRadius:12, padding:"20px 12px", textDecoration:"none", border:"1px solid #e2e8f0", transition:"all 0.2s" }}>
                  <div style={{ fontSize:28 }}>{board.icon}</div>
                  <span style={{ color:"#1e293b", fontWeight:700, fontSize:13 }}>{board.name}</span>
                  <span style={{ color:"#94a3b8", fontSize:11 }}>Search →</span>
                </a>
              ))}
            </div>
            <div style={{ background:"#f0f9ff", borderRadius:12, padding:"20px 24px", border:"1px solid #bae6fd", marginBottom:24 }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#0369a1", marginBottom:12 }}>📋 How to add a job</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                {[{s:"1",l:"Search",d:"Click a board and search"},{s:"2",l:"Find a role",d:"Click a job posting"},{s:"3",l:"Copy JD",d:"Copy the job description"},{s:"4",l:"Add to Tracker",d:"Tracker tab → + Add Job"}].map(s=>(
                  <div key={s.s} style={{ textAlign:"center" }}>
                    <div style={{ width:28,height:28,background:"#0369a1",borderRadius:"50%",color:"#fff",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px" }}>{s.s}</div>
                    <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:4 }}>{s.l}</div>
                    <div style={{ fontSize:12,color:"#64748b" }}>{s.d}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:10 }}>⚡ Quick Add from URL</div>
              <div style={{ display:"flex",gap:10 }}>
                <input placeholder="Paste job posting URL here..." style={{ ...inputStyle,flex:1 }}
                  onKeyDown={e=>{ if(e.key==="Enter"&&e.target.value){ const url=e.target.value; const source=JOB_BOARDS.find(b=>url.toLowerCase().includes(b.name.toLowerCase()))?.name||"Other"; setNewJob(p=>({...p,url,source})); setShowAdd(true); e.target.value=""; }}} />
                <button onClick={()=>setShowAdd(true)} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:8,padding:"8px 20px",fontWeight:600,fontSize:13,cursor:"pointer",whiteSpace:"nowrap" }}>+ Add Job</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab==="resume" && (
        <div style={{ maxWidth:860, margin:"32px auto", padding:"0 24px" }}>
          <div style={{ background:"#fff", borderRadius:16, padding:32, boxShadow:"0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a" }}>My Resume</h2>
                <p style={{ color:"#64748b", fontSize:14, marginTop:4 }}>Upload a file or paste text. Used for all AI gap analyses.</p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>fileInputRef.current?.click()} style={{ background:"#f1f5f9",color:"#374151",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 16px",fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
                  {uploadingResume?<span style={{ display:"inline-block",width:14,height:14,border:"2px solid #6366f1",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.6s linear infinite" }}/>:"📁"} Upload File
                </button>
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={handleResumeUpload} style={{ display:"none" }} />
                {resumeText&&<button onClick={()=>setEditingResume(!editingResume)} style={{ background:editingResume?"#6366f1":"#f1f5f9",color:editingResume?"#fff":"#374151",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:600,fontSize:13,cursor:"pointer" }}>{editingResume?"✓ Save":"✏️ Edit"}</button>}
              </div>
            </div>
            {!resumeText&&(
              <div className="upload-zone" onClick={()=>fileInputRef.current?.click()} style={{ border:"2px dashed #cbd5e1",borderRadius:12,padding:"48px 24px",textAlign:"center",cursor:"pointer",transition:"all 0.2s",marginBottom:20,background:"#fafafa" }}>
                <div style={{ fontSize:40,marginBottom:12 }}>📄</div>
                <div style={{ fontWeight:700,color:"#374151",fontSize:15,marginBottom:6 }}>Drop your resume here or click to upload</div>
                <div style={{ color:"#94a3b8",fontSize:13 }}>Supports PDF, DOCX, and TXT files</div>
              </div>
            )}
            {resumeFileName&&<div style={{ background:"#f0fdf4",borderRadius:8,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",border:"1px solid #bbf7d0" }}><span style={{ color:"#166534",fontSize:13,fontWeight:600 }}>✅ {resumeFileName}</span><button onClick={()=>{setResumeText("");setResumeFileName(null);}} style={{ background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:16 }}>✕</button></div>}
            {resumeText
              ? editingResume
                ? <textarea value={resumeText} onChange={e=>setResumeText(e.target.value)} style={{ ...inputStyle,minHeight:400,fontFamily:"'DM Mono',monospace",fontSize:13,lineHeight:1.7,resize:"vertical" }} />
                : <pre style={{ background:"#f8fafc",borderRadius:10,padding:20,fontSize:13,fontFamily:"'DM Mono',monospace",lineHeight:1.7,color:"#334155",whiteSpace:"pre-wrap",wordBreak:"break-word",border:"1px solid #e2e8f0",maxHeight:500,overflowY:"auto" }}>{resumeText}</pre>
              : <div style={{ marginTop:8 }}>
                  <div style={{ fontSize:12,fontWeight:600,color:"#64748b",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em" }}>Or paste resume text directly</div>
                  <textarea value={resumeText} onChange={e=>setResumeText(e.target.value)} placeholder={"Paste your resume text here...\n\nSKILLS: SQL, Power BI, Agile...\nEXPERIENCE:\n- Company (dates): Role..."} style={{ ...inputStyle,minHeight:200,fontFamily:"'DM Mono',monospace",fontSize:13,lineHeight:1.7,resize:"vertical" }} />
                </div>
            }
          </div>
        </div>
      )}

      {activeTab==="tracker" && (
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"24px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:24 }}>
            {[{label:"Total Jobs",value:stats.total,icon:"📋",color:"#6366f1"},{label:"Applied",value:stats.applied,icon:"📤",color:"#3b82f6"},{label:"Interviewing",value:stats.interviewing,icon:"💬",color:"#7c3aed"},{label:"Offers",value:stats.offers,icon:"🎉",color:"#10b981"},{label:"Avg Match",value:stats.avgScore+"%",icon:"🎯",color:"#f59e0b"}].map(s=>(
              <div key={s.label} className="stat-card" style={{ background:"#fff",borderRadius:12,padding:"16px 20px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)",borderTop:`3px solid ${s.color}` }}>
                <div style={{ fontSize:20,marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize:26,fontWeight:800,color:"#0f172a",lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:12,color:"#64748b",marginTop:4,fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"400px 1fr", gap:20, alignItems:"start" }}>
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,gap:8 }}>
                <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ ...inputStyle,width:"auto",fontSize:13,padding:"6px 12px" }}>
                  <option>All</option>{STATUSES.map(s=><option key={s}>{s}</option>)}
                </select>
                <button onClick={()=>setShowAdd(true)} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:600,fontSize:13,cursor:"pointer" }}>+ Add Job</button>
                <button onClick={downloadCSV} disabled={!jobs.length} style={{background:"#f1f5f9",color:"#374151",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",fontSize:13,fontWeight:600,cursor:jobs.length?"pointer":"not-allowed",opacity:jobs.length?1:0.4}}>⬇ CSV</button>
              </div>
              {jobs.length>0&&(
                <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="🔍 Search by title or company..." style={{ ...inputStyle,marginBottom:12,fontSize:13 }} />
              )}
              {jobs.length===0
                ? <div style={{ background:"#fff",borderRadius:16,padding:"48px 32px",textAlign:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize:48,marginBottom:16 }}>🎯</div>
                    <h3 style={{ color:"#0f172a",fontSize:17,fontWeight:700,marginBottom:8 }}>Hi {user.name}! Start tracking your search</h3>
                    <p style={{ color:"#64748b",fontSize:14,marginBottom:16,lineHeight:1.6 }}>Browse job boards, find a role you like, and add it here for AI analysis.</p>
                    <div style={{ display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap" }}>
                      <button onClick={()=>setActiveTab("boards")} style={{ background:"#f1f5f9",color:"#374151",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,fontSize:13,cursor:"pointer" }}>🔍 Browse Job Boards</button>
                      <button onClick={()=>setShowAdd(true)} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,fontSize:13,cursor:"pointer" }}>+ Add Job Manually</button>
                    </div>
                  </div>
                : <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {filtered.map(job=>(
                      <div key={job.id} className="job-row" onClick={()=>setSelected(job.id)}
                        style={{ background:selected===job.id?"#eef2ff":"#fff",border:selected===job.id?"2px solid #6366f1":"2px solid transparent",borderRadius:12,padding:"14px 16px",cursor:"pointer",boxShadow:selected===job.id?"0 4px 16px rgba(99,102,241,0.15)":"0 1px 3px rgba(0,0,0,0.06)" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6 }}>
                          <div>
                            <div style={{ fontWeight:700,fontSize:14,color:"#0f172a" }}>{job.title}</div>
                            <div style={{ fontSize:12,color:"#64748b",marginTop:2 }}>{job.company} · {job.location}{job.source&&<span style={{ marginLeft:6,background:"#eff6ff",color:"#2563eb",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:600 }}>{job.source}</span>}</div>
                          </div>
                          {job.score>0&&<ScoreBadge score={job.score}/>}
                        </div>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                          <StatusBadge status={job.status}/>
                          <span style={{ fontSize:11,color:"#94a3b8" }}>{job.date}</span>
                        </div>
                        {job.analysis&&<div style={{ marginTop:6,fontSize:11,color:"#6366f1",fontWeight:600 }}>✓ Analysis complete</div>}
                      </div>
                    ))}
                    {filtered.length===0&&jobs.length>0&&<div style={{ textAlign:"center",padding:"40px 20px",color:"#94a3b8",fontSize:14 }}>{q?`No jobs matching "${searchQuery}".`:`No jobs with status "${filterStatus}".`}</div>}
                  </div>
              }
            </div>
            <div>
              {selectedJob
                ? <div style={{ background:"#fff",borderRadius:16,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",overflow:"hidden",animation:"fadeIn 0.2s ease" }}>
                    <div style={{ background:"linear-gradient(135deg,#0f172a,#1e293b)",padding:"24px 28px" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                        <div>
                          <h2 style={{ color:"#fff",fontSize:20,fontWeight:800 }}>{selectedJob.title}</h2>
                          <div style={{ color:"#94a3b8",fontSize:14,marginTop:4 }}>{selectedJob.company} · {selectedJob.location}{selectedJob.source&&<span style={{ marginLeft:8,background:"rgba(255,255,255,0.1)",color:"#94a3b8",borderRadius:4,padding:"1px 8px",fontSize:11 }}>{selectedJob.source}</span>}</div>
                          {selectedJob.salary&&<div style={{ color:"#818cf8",fontSize:13,marginTop:4,fontWeight:600 }}>{selectedJob.salary}</div>}
                        </div>
                        <div style={{ display:"flex",gap:8 }}>
                          {selectedJob.jd&&<button onClick={()=>{setTailorSeed({jd:selectedJob.jd,title:selectedJob.title,company:selectedJob.company});setActiveTab("tailor");}} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer" }}>✨ Tailor Resume</button>}
                          {selectedJob.url&&<a href={selectedJob.url} target="_blank" rel="noopener noreferrer" style={{ background:"rgba(255,255,255,0.1)",color:"#fff",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,textDecoration:"none",border:"1px solid rgba(255,255,255,0.15)" }}>Apply →</a>}
                          <button onClick={()=>{setJobs(p=>p.filter(j=>j.id!==selectedJob.id));setSelected(null);}} style={{ background:"rgba(255,255,255,0.05)",color:"#94a3b8",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"7px 10px",fontSize:13,cursor:"pointer" }}>🗑</button>
                        </div>
                      </div>
                      <div style={{ display:"flex",gap:6,marginTop:16,flexWrap:"wrap" }}>
                        {STATUSES.map(s=>(
                          <button key={s} onClick={()=>setJobs(p=>p.map(j=>j.id===selectedJob.id?{...j,status:s}:j))}
                            style={{ background:selectedJob.status===s?"#6366f1":"rgba(255,255,255,0.08)",color:selectedJob.status===s?"#fff":"#94a3b8",border:"none",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding:"24px 28px" }}>
                      <div style={{ marginBottom:24 }}>
                        <div style={{ fontSize:11,fontWeight:700,color:"#6366f1",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8 }}>Job Description</div>
                        <div style={{ background:"#f8fafc",borderRadius:10,padding:"14px 16px",fontSize:13,color:"#475569",lineHeight:1.7,border:"1px solid #e2e8f0",maxHeight:120,overflowY:"auto" }}>{selectedJob.jd||<span style={{ color:"#94a3b8",fontStyle:"italic" }}>No JD added.</span>}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:11,fontWeight:700,color:"#6366f1",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:12 }}>AI Gap Analysis</div>
                        <AnalysisPanel analysis={selectedJob.analysis} loading={loadingId===selectedJob.id} onRun={()=>runAnalysis(selectedJob)} jobTitle={selectedJob.title} company={selectedJob.company} hasResume={hasResume}/>
                      </div>
                    </div>
                  </div>
                : <div style={{ background:"#fff",borderRadius:16,padding:"60px 32px",textAlign:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize:48,marginBottom:16 }}>👈</div>
                    <div style={{ color:"#64748b",fontSize:15 }}>Select a job to see details and run AI analysis.</div>
                  </div>
              }
            </div>
          </div>
        </div>
      )}

      {showAdd&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
          <div style={{ background:"#fff",borderRadius:16,padding:32,width:"100%",maxWidth:540,maxHeight:"90vh",overflowY:"auto",animation:"fadeIn 0.2s ease" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
              <h3 style={{ fontSize:18,fontWeight:800,color:"#0f172a" }}>Add New Job</h3>
              <button onClick={()=>setShowAdd(false)} style={{ background:"#f1f5f9",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16 }}>✕</button>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={labelStyle}>Source Platform</label>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {["Indeed","LinkedIn","Glassdoor","Dice","Wellfound","Other"].map(s=>(
                  <button key={s} onClick={()=>setNewJob(p=>({...p,source:s}))} style={{ background:newJob.source===s?"#6366f1":"#f1f5f9",color:newJob.source===s?"#fff":"#374151",border:"none",borderRadius:6,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer" }}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              {[{label:"Company *",key:"company",placeholder:"e.g. Azra AI"},{label:"Job Title *",key:"title",placeholder:"e.g. Product Analyst"},{label:"Location",key:"location",placeholder:"Remote"},{label:"Salary Range",key:"salary",placeholder:"e.g. $90,000–$110,000"},{label:"Apply URL",key:"url",placeholder:"https://..."}].map(f=>(
                <div key={f.key}><label style={labelStyle}>{f.label}</label><input value={newJob[f.key]} onChange={e=>setNewJob(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={inputStyle}/></div>
              ))}
              <div><label style={labelStyle}>Status</label><select value={newJob.status} onChange={e=>setNewJob(p=>({...p,status:e.target.value}))} style={inputStyle}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
              <div>
                <label style={labelStyle}>Job Description <span style={{ color:"#94a3b8",fontWeight:400,textTransform:"none",fontSize:11 }}>— paste for AI analysis</span></label>
                <textarea value={newJob.jd} onChange={e=>setNewJob(p=>({...p,jd:e.target.value}))} placeholder="Paste the full job description here..." style={{ ...inputStyle,minHeight:120,resize:"vertical" }}/>
              </div>
              <div style={{ display:"flex",gap:10,marginTop:4 }}>
                <button onClick={()=>setShowAdd(false)} style={{ flex:1,background:"#f1f5f9",color:"#374151",border:"none",borderRadius:8,padding:10,fontWeight:600,fontSize:14,cursor:"pointer" }}>Cancel</button>
                <button onClick={addJob} disabled={!newJob.company||!newJob.title} style={{ flex:2,background:(!newJob.company||!newJob.title)?"#e2e8f0":"linear-gradient(135deg,#6366f1,#8b5cf6)",color:(!newJob.company||!newJob.title)?"#94a3b8":"#fff",border:"none",borderRadius:8,padding:10,fontWeight:600,fontSize:14,cursor:(!newJob.company||!newJob.title)?"not-allowed":"pointer" }}>Add Job</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}