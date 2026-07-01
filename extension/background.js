// Background service worker: receives application events, persists them, and
// keeps the toolbar badge showing today's application count.
import { addApp, getApps, statsFrom } from "./lib/db.js";

async function refreshBadge() {
  const { todayCount } = statsFrom(await getApps());
  await chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
  await chrome.action.setBadgeText({ text: todayCount ? String(todayCount) : "" });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg?.type === "APPLICATION_DETECTED" || msg?.type === "LOG_APPLICATION") {
      const res = await addApp(msg.data || {});
      await refreshBadge();
      sendResponse(res);
    } else if (msg?.type === "REFRESH_BADGE") {
      await refreshBadge();
      sendResponse({ ok: true });
    }
  })();
  return true; // keep the message channel open for the async response
});

chrome.runtime.onInstalled.addListener(refreshBadge);
chrome.runtime.onStartup.addListener(refreshBadge);
