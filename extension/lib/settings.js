// Shared settings for the JobTrack AI extension: where the tailoring API lives,
// and the user's resume text (pasted once, reused for every tailoring request).

const API_BASE_KEY = "jt_api_base_url";
const RESUME_KEY = "jt_resume_text";

export async function getApiBaseUrl() {
  const r = await chrome.storage.local.get(API_BASE_KEY);
  return typeof r[API_BASE_KEY] === "string" ? r[API_BASE_KEY] : "";
}

/** Strips a trailing slash so callers can safely do `${base}/api/tailor`. */
export async function setApiBaseUrl(url) {
  const clean = (url || "").trim().replace(/\/+$/, "");
  await chrome.storage.local.set({ [API_BASE_KEY]: clean });
  return clean;
}

export async function getResumeText() {
  const r = await chrome.storage.local.get(RESUME_KEY);
  return typeof r[RESUME_KEY] === "string" ? r[RESUME_KEY] : "";
}

export async function setResumeText(text) {
  const clean = text || "";
  await chrome.storage.local.set({ [RESUME_KEY]: clean });
  return clean;
}
