// Content script: best-effort auto-detection of application submissions on
// major job sites. Runs only on the domains listed in manifest.json.
// On a likely "submit application" click, it messages the background worker,
// which dedupes (one per URL per day) and stores the entry.
(function () {
  // Strong signals that a real application was submitted.
  const STRONG =
    /\b(submit application|submit your application|send application|apply now|easy apply)\b/i;
  // On dedicated ATS domains, a plain "Submit" is almost always the application.
  const ATS_HOSTS = /(greenhouse\.io|lever\.co|myworkdayjobs\.com|ashbyhq\.com)$/i;
  const PLAIN_SUBMIT = /^\s*submit\s*$/i;

  function looksLikeApply(label) {
    if (!label) return false;
    if (STRONG.test(label)) return true;
    if (PLAIN_SUBMIT.test(label) && ATS_HOSTS.test(location.hostname)) return true;
    return false;
  }

  function extract() {
    const meta = (p) =>
      document.querySelector(`meta[property="${p}"], meta[name="${p}"]`)?.content;
    const title =
      meta("og:title") ||
      document.querySelector("h1")?.innerText ||
      document.title ||
      "";
    const company =
      meta("og:site_name") || location.hostname.replace(/^www\./, "");
    return {
      title: String(title).trim().slice(0, 140),
      company: String(company).trim().slice(0, 80),
      url: location.href,
      source: location.hostname.replace(/^www\./, ""),
      method: "auto",
    };
  }

  // Capture phase so we still see the click even if the site stops propagation.
  document.addEventListener(
    "click",
    (e) => {
      const el = e.target?.closest?.(
        "button, a, input[type=submit], [role=button]"
      );
      if (!el) return;
      const label = (
        el.innerText ||
        el.value ||
        el.getAttribute("aria-label") ||
        ""
      ).trim();
      if (!looksLikeApply(label)) return;
      try {
        chrome.runtime.sendMessage({
          type: "APPLICATION_DETECTED",
          data: extract(),
        });
      } catch {
        // extension context can be invalidated on reload; ignore
      }
    },
    true
  );
})();
