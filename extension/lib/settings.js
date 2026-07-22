// Shared settings for the JobTrack AI extension: where the tailoring API lives,
// and the user's resume text (pasted once, reused for every tailoring request).

const API_BASE_KEY = "jt_api_base_url";
const RESUME_KEY = "jt_resume_text";

// Never throw — a storage read/write failure (extension context invalidated,
// quota exceeded, storage disabled) should degrade to an empty value rather
// than leave options.js/tailor.js's top-level init stuck on an unhandled
// rejection (dead page: fields never populate, event listeners never attach).
// Mirrors extension/lib/db.js's getApps/saveApps guard.
export async function getApiBaseUrl() {
  try {
    const r = await chrome.storage.local.get(API_BASE_KEY);
    return typeof r[API_BASE_KEY] === "string" ? r[API_BASE_KEY] : "";
  } catch {
    return "";
  }
}

/** Strips a trailing slash so callers can safely do `${base}/api/tailor`. */
export async function setApiBaseUrl(url) {
  const clean = (url || "").trim().replace(/\/+$/, "");
  try {
    await chrome.storage.local.set({ [API_BASE_KEY]: clean });
  } catch {
    // storage full/disabled — fail silently, mirroring extension/lib/db.js
  }
  return clean;
}

export async function getResumeText() {
  try {
    const r = await chrome.storage.local.get(RESUME_KEY);
    return typeof r[RESUME_KEY] === "string" ? r[RESUME_KEY] : "";
  } catch {
    return "";
  }
}

export async function setResumeText(text) {
  const clean = text || "";
  try {
    await chrome.storage.local.set({ [RESUME_KEY]: clean });
  } catch {
    // storage full/disabled — fail silently, mirroring extension/lib/db.js
  }
  return clean;
}
