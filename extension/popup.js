import { addApp, getApps, statsFrom } from "./lib/db.js";

const $ = (id) => document.getElementById(id);

async function render() {
  const s = statsFrom(await getApps());
  $("today").textContent = s.todayCount;
  $("streak").textContent = s.streak;
  $("total").textContent = s.total;
}

// Prefill the form from the active tab (title/company via a page extractor).
async function prefill() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    $("url").value = tab.url || "";
    let info = { title: "", company: "" };
    try {
      const [res] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const meta = (p) =>
            document.querySelector(`meta[property="${p}"], meta[name="${p}"]`)?.content;
          const title =
            meta("og:title") || document.querySelector("h1")?.innerText || document.title || "";
          const company = meta("og:site_name") || location.hostname.replace(/^www\./, "");
          return {
            title: String(title).trim().slice(0, 140),
            company: String(company).trim().slice(0, 80),
          };
        },
      });
      if (res?.result) info = res.result;
    } catch {
      // scripting blocked (e.g. chrome:// pages) — fall back to tab title
    }
    $("title").value = info.title || tab.title || "";
    $("company").value = info.company || "";
  } catch {
    // no tab access; leave fields empty
  }
}

$("save").addEventListener("click", async () => {
  const res = await addApp({
    title: $("title").value,
    company: $("company").value,
    url: $("url").value,
    source: "popup",
    method: "manual",
  });
  chrome.runtime.sendMessage({ type: "REFRESH_BADGE" });
  const msg = $("msg");
  msg.textContent = res.added ? "✓ Logged!" : "Already logged this today.";
  msg.style.color = res.added ? "#059669" : "#b45309";
  await render();
});

$("open-dashboard").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
});

$("open-settings").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

render();
prefill();
