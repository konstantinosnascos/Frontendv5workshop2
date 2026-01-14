// IssueHub Mini - intentionally simple
// Bra förbättrings-issues: localStorage, bättre validering, keyboard support, dark mode, etc.

const els = {
  form: document.querySelector("#taskForm"),
  title: document.querySelector("#taskTitle"),
  tag: document.querySelector("#taskTag"),
  filter: document.querySelector("#filterInput"),
  seed: document.querySelector("#seedBtn"),
  backlog: document.querySelector("#backlogList"),
  done: document.querySelector("#doneList"),
};

let tasks = [
  { id: crypto.randomUUID(), title: "Skapa GitHub Issues", tag: "docs", status: "backlog" },
  { id: crypto.randomUUID(), title: "Öppna en Pull Request", tag: "feature", status: "backlog" },
  { id: crypto.randomUUID(), title: "Gör Code Review", tag: "chore", status: "done" },
];

function normalize(str) {
  return (str ?? "").toLowerCase().trim();
}

function addTask(title, tag) {
  const t = { id: crypto.randomUUID(), title: title.trim(), tag, status: "backlog" };
  tasks.unshift(t);
  render();
}

function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  render();
}

function toggleDone(id) {
  tasks = tasks.map(t => (t.id === id ? { ...t, status: t.status === "done" ? "backlog" : "done" } : t));
  render();
}

function render() {
  const q = normalize(els.filter.value);

  const visible = tasks.filter(t => {
    if (!q) return true;
    return normalize(t.title).includes(q) || normalize(t.tag).includes(q);
  });

  const backlog = visible.filter(t => t.status === "backlog");
  const done = visible.filter(t => t.status === "done");

  els.backlog.innerHTML = backlog.map(taskItemHTML).join("");
  els.done.innerHTML = done.map(taskItemHTML).join("");

  wireListEvents(els.backlog);
  wireListEvents(els.done);
}

function taskItemHTML(t) {
  return `
    <li class="item" data-id="${t.id}">
      <div>
        <div>${escapeHTML(t.title)}</div>
        <div class="badge">${escapeHTML(t.tag)}</div>
      </div>
      <div class="actions">
        <button class="iconbtn" data-action="toggle" type="button">
          ${t.status === "done" ? "↩︎" : "✓"}
        </button>
        <button class="iconbtn" data-action="delete" type="button">🗑</button>
      </div>
    </li>
  `;
}

function wireListEvents(listEl) {
  // Event delegation: binds once per render on both lists (simple but ok for this lab)
  listEl.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const action = e.currentTarget.dataset.action;
      const li = e.currentTarget.closest("[data-id]");
      const id = li?.dataset?.id;
      if (!id) return;

      if (action === "toggle") toggleDone(id);
      if (action === "delete") removeTask(id);
    });
  });
}

function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Handlers
els.form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = els.title.value;
  const tag = els.tag.value;

  // medvetet enkel validering → bra Issue: "Better validation"
  if (!title || title.trim().length < 3) {
    alert("Titeln måste vara minst 3 tecken.");
    return;
  }

  addTask(title, tag);
  els.form.reset();
  els.title.focus();
});

els.filter.addEventListener("input", render);

els.seed.addEventListener("click", () => {
  const seed = [
    { title: "Lägg till header", tag: "feature" },
    { title: "Fixa typo i footer", tag: "bug" },
    { title: "Förbättra README", tag: "docs" },
  ];
  seed.forEach(s => addTask(s.title, s.tag));
});

render();
