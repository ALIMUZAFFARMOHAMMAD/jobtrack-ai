import { getApiBaseUrl, setApiBaseUrl, getResumeText, setResumeText } from "./lib/settings.js";

const $ = (id) => document.getElementById(id);

async function load() {
  $("apiBase").value = await getApiBaseUrl();
  $("resume").value = await getResumeText();
}

$("save").addEventListener("click", async () => {
  await setApiBaseUrl($("apiBase").value);
  await setResumeText($("resume").value);
  const msg = $("msg");
  msg.textContent = "✓ Saved.";
  msg.style.color = "#059669";
  setTimeout(() => { msg.textContent = ""; }, 2000);
});

load();
