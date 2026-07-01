import { getApps, statsFrom, lastNDays, toCSV, deleteApp, todayStr } from "./lib/db.js";

const $ = (id) => document.getElementById(id);

function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderChart(byDate) {
  const days = lastNDays(byDate, 14);
  const max = Math.max(1, ...days.map((d) => d.count));
  const chart = $("chart");
  chart.innerHTML = "";
  for (const d of days) {
    const col = document.createElement("div");
    col.className = "bar-col";
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${(d.count / max) * 100}%`;
    if (d.count) {
      const n = document.createElement("span");
      n.textContent = d.count;
      bar.appendChild(n);
    }
    const label = document.createElement("small");
    label.textContent = d.date.slice(5); // MM-DD
    col.appendChild(bar);
    col.appendChild(label);
    chart.appendChild(col);
  }
}

function renderTable(apps) {
  const rows = $("rows");
  rows.innerHTML = "";
  const sorted = [...apps].sort((a, b) => (a.ts < b.ts ? 1 : -1));
  $("empty").hidden = sorted.length > 0;
  for (const a of sorted) {
    const tr = document.createElement("tr");

    const td = (html) => {
      const cell = document.createElement("td");
      if (html instanceof Node) cell.appendChild(html);
      else cell.textContent = html;
      return cell;
    };

    let roleCell;
    if (a.url) {
      const link = document.createElement("a");
      link.href = a.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = a.title;
      roleCell = link;
    } else {
      roleCell = a.title;
    }

    const delBtn = document.createElement("button");
    delBtn.className = "del";
    delBtn.textContent = "✕";
    delBtn.title = "Delete";
    delBtn.addEventListener("click", async () => {
      await deleteApp(a.id);
      chrome.runtime.sendMessage({ type: "REFRESH_BADGE" });
      await render();
    });

    tr.appendChild(td(a.date));
    tr.appendChild(td(a.company));
    tr.appendChild(td(roleCell));
    tr.appendChild(td(a.source || a.method || ""));
    tr.appendChild(td(delBtn));
    rows.appendChild(tr);
  }
}

async function render() {
  const apps = await getApps();
  const s = statsFrom(apps);
  const week = lastNDays(s.byDate, 7).reduce((sum, d) => sum + d.count, 0);
  $("today").textContent = s.todayCount;
  $("week").textContent = week;
  $("streak").textContent = s.streak;
  $("total").textContent = s.total;
  renderChart(s.byDate);
  renderTable(apps);
  $("export").disabled = apps.length === 0;
}

$("export").addEventListener("click", async () => {
  const apps = await getApps();
  if (!apps.length) return;
  download(`jobtrack-${todayStr()}.csv`, toCSV(apps), "text/csv;charset=utf-8");
});

render();
