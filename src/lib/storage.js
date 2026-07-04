// Guarded localStorage helpers. Never throw — a missing/corrupted/disabled
// localStorage should degrade to in-memory state, not blank-screen the app.
const PREFIX = "jobtrack_";

export function loadJSON(key, fallback) {
  if (typeof window === "undefined" || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full/disabled/private-mode — fail silently
  }
}

export function removeJSON(key) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
