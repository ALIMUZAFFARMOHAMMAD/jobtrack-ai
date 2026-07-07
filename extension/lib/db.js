// Shared storage layer for the JobTrack AI extension.
// Used by the background service worker, popup, and dashboard (all ES modules).
// Content scripts do NOT import this — they message the background worker instead.

const KEY = "jt_applications";

/** Local date as YYYY-MM-DD (not UTC). */
export function todayStr(d = new Date()) {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export async function getApps() {
  const r = await chrome.storage.local.get(KEY);
  return Array.isArray(r[KEY]) ? r[KEY] : [];
}

async function saveApps(apps) {
  await chrome.storage.local.set({ [KEY]: apps });
}

/** Dedupe key: one application per URL path per day. */
function dedupeKey(url, date) {
  let path = url || "";
  try {
    const u = new URL(url);
    path = u.origin + u.pathname;
  } catch {
    // non-URL input; use as-is
  }
  return date + "|" + path.toLowerCase();
}

/**
 * Add an application. Returns { added, rec?, reason?, apps }.
 * Skips if the same URL was already logged today (prevents double counting).
 */
export async function addApp({ company, title, url, source, method } = {}) {
  const apps = await getApps();
  const date = todayStr();
  const key = dedupeKey(url, date);
  if (apps.some((a) => a._key === key)) {
    return { added: false, reason: "duplicate", apps };
  }
  const id =
    (globalThis.crypto && crypto.randomUUID && crypto.randomUUID()) ||
    String(Date.now()) + Math.random().toString(16).slice(2);
  const rec = {
    id,
    ts: new Date().toISOString(),
    date,
    company: (company || "").trim() || "Unknown",
    title: (title || "").trim() || "Unknown role",
    url: url || "",
    source: source || "manual",
    method: method || "manual",
    status: "Applied",
    _key: key,
  };
  apps.push(rec);
  await saveApps(apps);
  return { added: true, rec, apps };
}

export async function deleteApp(id) {
  const apps = (await getApps()).filter((a) => a.id !== id);
  await saveApps(apps);
  return apps;
}

/** Update an application's company/title (id and other fields are untouched). */
export async function updateApp(id, { company, title } = {}) {
  const apps = await getApps();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx === -1) return apps;
  const next = { ...apps[idx] };
  if (company !== undefined) next.company = (company || "").trim() || "Unknown";
  if (title !== undefined) next.title = (title || "").trim() || "Unknown role";
  apps[idx] = next;
  await saveApps(apps);
  return apps;
}

/** Aggregate stats from a list of applications. */
export function statsFrom(apps) {
  const byDate = {};
  for (const a of apps) byDate[a.date] = (byDate[a.date] || 0) + 1;

  const todayCount = byDate[todayStr()] || 0;

  // Streak = consecutive days (ending today) with >= 1 application.
  let streak = 0;
  const d = new Date();
  while (byDate[todayStr(d)]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  return { total: apps.length, todayCount, streak, byDate };
}

/** Array of { date, count } for the last n days, oldest first. */
export function lastNDays(byDate, n) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = todayStr(d);
    out.push({ date: ds, count: byDate[ds] || 0 });
  }
  return out;
}

/** CSV string (opens in Excel / Google Sheets), newest first. */
export function toCSV(apps) {
  const cols = ["date", "company", "title", "status", "source", "method", "url", "ts"];
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const rows = [cols.join(",")];
  const sorted = [...apps].sort((a, b) => (a.ts < b.ts ? 1 : -1));
  for (const a of sorted) rows.push(cols.map((c) => esc(a[c])).join(","));
  return rows.join("\n");
}
