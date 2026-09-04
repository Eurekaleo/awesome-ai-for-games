const ROLE_META = {
  play: { label: "Game-Playing Agents" },
  model: { label: "Game & Player Models" },
  design: { label: "Game Design & Content" },
  build: { label: "Development & Maintenance" },
  runtime: { label: "Runtime Generation" },
  test: { label: "Testing & Evaluation" },
};

const els = {
  list: document.querySelector("#paper-list"),
  status: document.querySelector("#catalog-status"),
  empty: document.querySelector("#empty-state"),
  search: document.querySelector("#paper-search"),
  role: document.querySelector("#role-filter"),
  year: document.querySelector("#year-filter"),
  clear: document.querySelector("#clear-filters"),
  count: document.querySelector("#paper-count"),
};

let papers = [];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(value = "") {
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function prettyTopic(value = "") {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sortPapers(items) {
  return [...items].sort((a, b) => {
    const year = Number(b.year || 0) - Number(a.year || 0);
    if (year) return year;
    const month = Number(b.month || 0) - Number(a.month || 0);
    if (month) return month;
    return String(a.title).localeCompare(String(b.title));
  });
}

function paperRow(paper) {
  const role = ROLE_META[paper.primaryRole] || { label: "Other" };
  const topics = (paper.topics || []).slice(0, 3);
  const meta = [
    paper.venue ? `<span>${escapeHtml(paper.venue)}</span>` : "",
    ...topics.map((topic) => `<span class="topic">${escapeHtml(prettyTopic(topic))}</span>`),
  ].filter(Boolean).join("");

  const title = escapeHtml(paper.title || "Untitled work");
  const href = safeUrl(paper.url || "");
  const titleMarkup = href === "#"
    ? `<span class="paper-title">${title}</span>`
    : `<a class="paper-title" href="${escapeHtml(href)}" target="_blank" rel="noopener">${title} ↗</a>`;

  return `
    <article class="paper-row" data-role="${escapeHtml(paper.primaryRole || "")}">
      <span class="paper-year">${escapeHtml(paper.year || "—")}</span>
      <div class="paper-main">
        ${titleMarkup}
        <div class="paper-meta">${meta}</div>
      </div>
      <span class="paper-role">${escapeHtml(role.label)}</span>
    </article>`;
}

function updateUrl() {
  const params = new URLSearchParams();
  if (els.search.value.trim()) params.set("q", els.search.value.trim());
  if (els.role.value) params.set("collection", els.role.value);
  if (els.year.value) params.set("year", els.year.value);
  const query = params.toString();
  history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
}

function render() {
  const query = els.search.value.trim().toLowerCase();
  const role = els.role.value;
  const year = els.year.value;

  const filtered = papers.filter((paper) => {
    if (role && paper.primaryRole !== role) return false;
    if (year && String(paper.year) !== year) return false;
    if (!query) return true;
    const haystack = [
      paper.title,
      paper.venue,
      paper.summary,
      ...(paper.topics || []),
    ].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(query);
  });

  els.list.innerHTML = filtered.map(paperRow).join("");
  els.empty.hidden = filtered.length !== 0;
  els.status.textContent = `${filtered.length} ${filtered.length === 1 ? "paper" : "papers"}`;
  updateUrl();
}

function populateFilters() {
  Object.entries(ROLE_META).forEach(([value, meta]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = meta.label;
    els.role.append(option);
  });

  const years = [...new Set(papers.map((paper) => paper.year))]
    .filter(Boolean)
    .sort((a, b) => b - a);
  years.forEach((value) => {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = String(value);
    els.year.append(option);
  });

  Object.keys(ROLE_META).forEach((role) => {
    const count = papers.filter((paper) => paper.primaryRole === role).length;
    document.querySelectorAll(`[data-count="${role}"]`).forEach((node) => {
      node.textContent = String(count);
    });
  });

  els.count.textContent = String(papers.length);
}

function restoreFilters() {
  const params = new URLSearchParams(window.location.search);
  els.search.value = params.get("q") || "";
  els.role.value = params.get("collection") || "";
  els.year.value = params.get("year") || "";
}

async function loadPapers() {
  try {
    const response = await fetch("data/papers.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    papers = sortPapers((payload.papers || []).filter((paper) => paper.status !== "context"));
    populateFilters();
    restoreFilters();
    render();
  } catch (error) {
    els.status.textContent = "The paper list could not be loaded.";
    els.list.innerHTML = `<div class="empty-state"><h3>Open the hosted collection</h3><p>The complete list is also available directly in the repository README.</p></div>`;
    console.error(error);
  }
}

els.search.addEventListener("input", render);
els.role.addEventListener("change", render);
els.year.addEventListener("change", render);
els.clear.addEventListener("click", () => {
  els.search.value = "";
  els.role.value = "";
  els.year.value = "";
  render();
});

document.querySelectorAll("[data-role]").forEach((button) => {
  if (!button.classList.contains("collection-card")) return;
  button.addEventListener("click", () => {
    els.role.value = button.dataset.role || "";
    els.year.value = "";
    els.search.value = "";
    render();
    document.querySelector("#papers").scrollIntoView({ behavior: "smooth" });
  });
});

loadPapers();
