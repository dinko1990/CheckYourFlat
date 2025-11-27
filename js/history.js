// history.js
// Local history of generated reports:
// - Reads and writes history metadata from localStorage
// - Renders the history list in the sidebar section
// - Hooks into report creation to append new entries
// - Also triggers initial render and version info display on load

/* ========= HISTORY ========= */
  const HISTORY_KEY = "cyf-history-v3";
  const historyListEl = document.getElementById("history-list");

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  function saveHistoryEntry(entry) {
    const list = loadHistory();
    list.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 40)));
  }

  function renderHistory() {
    const list = loadHistory();
    historyListEl.innerHTML = "";
    if (!list.length) {
      const p = document.createElement("p");
      p.style.fontSize = "11px";
      p.style.color = "#7a719d";
      p.textContent = "No reports exported yet.";
      historyListEl.appendChild(p);
      return;
    }
    list.forEach(item => {
      const div = document.createElement("div");
      div.className = "history-item";

      const main = document.createElement("div");
      main.className = "history-main";

      const title = document.createElement("div");
      title.textContent = item.filename;

      const meta = document.createElement("div");
      meta.className = "history-meta";
      meta.textContent = (item.address || "") + " • " + item.when +
        (item.validator ? " • " + item.validator : "");

      main.appendChild(title);
      main.appendChild(meta);

      const tag = document.createElement("span");
      tag.className = "history-tag";
      tag.textContent = "PDF";

      div.appendChild(main);
      div.appendChild(tag);
      historyListEl.appendChild(div);
    });
  }

  renderHistory();
  renderVersionInfo();
