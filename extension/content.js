// Injects api.js into the page context so it shares auth cookies, then builds the Blanq panel UI.

(function injectPageScripts() {
  const target = document.head || document.documentElement;
  for (const file of ["api.js", "bridge.js"]) {
    const s = document.createElement("script");
    s.src = chrome.runtime.getURL(file);
    s.onload = () => s.remove();
    target.appendChild(s);
  }
})();

// Bridge: content script asks page to run API calls via postMessage.
const pending = new Map();
let nextReqId = 1;

window.addEventListener("message", (ev) => {
  if (ev.source !== window || !ev.data || ev.data.__delgpt !== "response") return;
  const { reqId, ok, result, error } = ev.data;
  const p = pending.get(reqId);
  if (!p) return;
  pending.delete(reqId);
  ok ? p.resolve(result) : p.reject(new Error(error));
});

function callApi(method, args = []) {
  const reqId = nextReqId++;
  return new Promise((resolve, reject) => {
    pending.set(reqId, { resolve, reject });
    window.postMessage({ __delgpt: "request", reqId, method, args }, "*");
  });
}

// ---------- UI ----------

function createPanel() {
  if (document.getElementById("delgpt-panel")) return;

  const panel = document.createElement("div");
  panel.id = "delgpt-panel";
  panel.innerHTML = `
    <div class="delgpt-header">
      <img class="delgpt-logo" src="${chrome.runtime.getURL("icons/blanq_logo.png")}" alt="" />
      <span class="delgpt-title">Blanq</span>
      <span class="delgpt-status" id="delgpt-status">…</span>
      <button class="delgpt-icon" id="delgpt-help" title="Help">?</button>
      <button class="delgpt-icon" id="delgpt-refresh" title="Reload conversations">⟳</button>
      <button class="delgpt-icon delgpt-close" title="Close">×</button>
    </div>
    <div class="delgpt-help" id="delgpt-help-panel" hidden>
      <div class="delgpt-help-inner">
        <h3>How it works</h3>
        <ol>
          <li><b>Filter</b> your chats using the search box, scope chips, or a preset.</li>
          <li><b>Tick</b> the chats you want to act on (or use a preset to tick them for you).</li>
          <li><b>Click</b> Unpin, Unarchive, or Delete at the bottom.</li>
        </ol>

        <h3>Top bar</h3>
        <dl>
          <dt>⟳ Reload</dt><dd>Refetch your conversation list from ChatGPT.</dd>
          <dt>? Help</dt><dd>Shows this guide. Click again to close.</dd>
          <dt>× Close</dt><dd>Hides the panel. Reopen it from the floating button.</dd>
        </dl>

        <h3>Filters</h3>
        <dl>
          <dt>Search</dt><dd>Show only chats whose title contains what you type.</dd>
          <dt>All / Active / Archived / Pinned</dt>
          <dd>Narrow the list to one category. <b>Active</b> = your normal chats. <b>Archived</b> = chats you've archived. <b>Pinned</b> = chats you've starred.</dd>
        </dl>

        <h3>Presets (tick boxes for you)</h3>
        <dl>
          <dt>All visible</dt><dd>Ticks every chat currently shown.</dd>
          <dt>None / Invert</dt><dd>Untick all, or flip what's ticked.</dd>
          <dt>Today / This week</dt><dd>Ticks chats from today or the last 7 days.</dd>
          <dt>Older than 30/90/180/365 days</dt><dd>Ticks chats older than that.</dd>
          <dt>Untitled</dt><dd>Ticks chats with no title.</dd>
          <dt>Short titles</dt><dd>Ticks chats with titles 10 characters or shorter.</dd>
          <dt>Duplicate titles</dt><dd>Ticks chats that share a title with another chat.</dd>
          <dt>All archived / All unpinned</dt><dd>Ticks every archived / every non-pinned chat.</dd>
          <dt>Unarchived & unpinned</dt><dd>Ticks regular chats only — safest bulk-delete.</dd>
        </dl>

        <h3>Action button (appears when you tick something)</h3>
        <dl>
          <dt>Delete</dt><dd>Permanently deletes selected chats. <b>Cannot be undone.</b></dd>
        </dl>

        <h3>Icons in the list</h3>
        <dl>
          <dt>★</dt><dd>Chat is pinned.</dd>
          <dt>🗄</dt><dd>Chat is archived.</dd>
        </dl>

        <h3>Privacy</h3>
        <p class="delgpt-help-p">
          Blanq does not collect, store, or send any of your data anywhere.
          All actions run locally in your browser.
        </p>

        <h3>Links</h3>
        <p class="delgpt-help-p delgpt-links">
          <a href="https://llavkush.github.io/blanq/" target="_blank" rel="noopener">Home</a>
          <span>·</span>
          <a href="https://llavkush.github.io/blanq/privacy.html" target="_blank" rel="noopener">Privacy</a>
          <span>·</span>
          <a href="https://github.com/llavkush/blanq/issues/new" target="_blank" rel="noopener">Report a bug</a>
        </p>
        <a class="delgpt-star-link" href="https://github.com/llavkush/blanq" target="_blank" rel="noopener">
          <span class="delgpt-star-icon">★</span>
          Star on GitHub — it helps others find Blanq
        </a>
      </div>
    </div>
    <div class="delgpt-controls">
      <div class="delgpt-row">
        <input type="text" id="delgpt-search" placeholder="Search title…" />
      </div>
      <div class="delgpt-row delgpt-chips" id="delgpt-scope">
        <button class="delgpt-chip active" data-scope="all">All</button>
        <button class="delgpt-chip" data-scope="active">Active</button>
        <button class="delgpt-chip" data-scope="archived">Archived</button>
        <button class="delgpt-chip" data-scope="pinned">Pinned</button>
      </div>
      <div class="delgpt-row">
        <button class="delgpt-preset-trigger" id="delgpt-preset-trigger" type="button">
          <span class="delgpt-preset-label">Quick select</span>
          <span class="delgpt-preset-caret">▾</span>
        </button>
      </div>
    </div>
    <div class="delgpt-list" id="delgpt-list"></div>
    <div class="delgpt-actions" id="delgpt-actions" hidden>
      <span class="delgpt-sel-count" id="delgpt-sel-count">0 selected</span>
      <button id="delgpt-delete" class="delgpt-btn-danger" title="Delete selected">Delete</button>
    </div>
    <div class="delgpt-progress" id="delgpt-progress" hidden>
      <div class="delgpt-progress-card">
        <div class="delgpt-spinner"></div>
        <div class="delgpt-progress-label" id="delgpt-progress-label">Working…</div>
        <div class="delgpt-progress-count" id="delgpt-progress-count">0 / 0</div>
        <div class="delgpt-progress-bar"><div id="delgpt-progress-fill"></div></div>
        <div class="delgpt-progress-fail" id="delgpt-progress-fail"></div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  panel.querySelector("#delgpt-help").onclick = () => {
    const h = panel.querySelector("#delgpt-help-panel");
    h.hidden = !h.hidden;
  };
  panel.querySelector("#delgpt-refresh").onclick = () => {
    preloadPromise = null;
    preloadState = "idle";
    allConvos = [];
    setStatus("Reloading…");
    startPreload().then(() => {
      if (preloadState === "ready") renderList();
    });
  };
  panel.querySelector("#delgpt-delete").onclick = () => runBulk("delete");
  panel.querySelector("#delgpt-search").addEventListener("input", renderList);
  panel.querySelector("#delgpt-scope").addEventListener("click", (e) => {
    const chip = e.target.closest(".delgpt-chip");
    if (!chip) return;
    panel.querySelectorAll("#delgpt-scope .delgpt-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    renderList();
  });
  panel.querySelector("#delgpt-preset-trigger").addEventListener("click", openPresetMenu);
  panel.querySelector("#delgpt-list").addEventListener("change", updateSelectionUi);
  makeDraggable(panel, panel.querySelector(".delgpt-header"));

  // Auto-close when clicking outside the panel or pressing Escape.
  // Guarded so we don't close while a bulk action is running or a native dialog is open.
  const closePanel = () => {
    const progress = document.getElementById("delgpt-progress");
    if (progress && !progress.hidden) return; // don't close mid-action
    document.removeEventListener("mousedown", outsideClickHandler, true);
    document.removeEventListener("keydown", escHandler, true);
    panel.remove();
  };
  const outsideClickHandler = (e) => {
    if (!document.getElementById("delgpt-panel")) return;
    if (panel.contains(e.target)) return;
    if (e.target.closest("#delgpt-toggle")) return; // let the toggle button handle itself
    closePanel();
  };
  const escHandler = (e) => {
    if (e.key !== "Escape") return;
    closePanel();
  };
  // Defer until after the current click finishes, so the toggle click that opened the panel
  // doesn't immediately register as an "outside" click.
  setTimeout(() => {
    document.addEventListener("mousedown", outsideClickHandler, true);
    document.addEventListener("keydown", escHandler, true);
  }, 0);

  panel.querySelector(".delgpt-close").onclick = closePanel;
}

function createToggleButton() {
  if (document.getElementById("delgpt-toggle")) return;
  const btn = document.createElement("button");
  btn.id = "delgpt-toggle";
  btn.setAttribute("aria-label", "Open Blanq");
  btn.title = "Blanq — bulk chat cleaner";
  const logo = document.createElement("img");
  logo.src = chrome.runtime.getURL("icons/blanq_logo.png");
  logo.alt = "";
  btn.appendChild(logo);
  btn.onclick = () => {
    const existing = document.getElementById("delgpt-panel");
    if (existing) existing.remove();
    else {
      createPanel();
      if (preloadState === "ready") {
        renderList();
      } else if (preloadState === "loading") {
        setStatus("Loading…");
        preloadPromise.then(() => {
          if (document.getElementById("delgpt-panel") && preloadState === "ready") {
            renderList();
          } else if (preloadState === "error") {
            setStatus(`Error: ${preloadError}`);
          }
        });
      } else if (preloadState === "idle") {
        setStatus("Loading…");
        startPreload().then(() => {
          if (document.getElementById("delgpt-panel") && preloadState === "ready") renderList();
        });
      } else if (preloadState === "error") {
        setStatus(`Error: ${preloadError}`);
      }
    }
  };
  document.body.appendChild(btn);
}

function makeDraggable(el, handle) {
  let dx = 0, dy = 0, sx = 0, sy = 0, dragging = false;
  handle.style.cursor = "move";
  handle.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON") return;
    dragging = true;
    sx = e.clientX; sy = e.clientY;
    const r = el.getBoundingClientRect();
    dx = r.left; dy = r.top;
    el.style.left = `${dx}px`;
    el.style.top = `${dy}px`;
    el.style.right = "auto";
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    el.style.left = `${dx + e.clientX - sx}px`;
    el.style.top = `${dy + e.clientY - sy}px`;
  });
  window.addEventListener("mouseup", () => { dragging = false; });
}

// ---------- State ----------

let allConvos = [];
let preloadPromise = null;
let preloadState = "idle"; // idle | loading | ready | error
let preloadError = null;

function setStatus(msg) {
  const s = document.getElementById("delgpt-status");
  if (s) s.textContent = msg;
}

function startPreload() {
  if (preloadPromise) return preloadPromise;
  preloadState = "loading";
  preloadPromise = (async () => {
    try {
      const [active, archived] = await Promise.all([
        callApi("listAllConversations", [{ isArchived: false }]),
        callApi("listAllConversations", [{ isArchived: true }]),
      ]);
      active.forEach((c) => (c.__archived = false));
      archived.forEach((c) => (c.__archived = true));
      allConvos = [...active, ...archived];
      preloadState = "ready";
    } catch (e) {
      preloadState = "error";
      preloadError = e.message;
      console.error("Blanq preload failed:", e);
    }
  })();
  return preloadPromise;
}

function getScope() {
  const active = document.querySelector("#delgpt-scope .delgpt-chip.active");
  return active ? active.dataset.scope : "all";
}

function filtered() {
  const scope = getScope();
  const q = document.getElementById("delgpt-search").value.trim().toLowerCase();

  return allConvos.filter((c) => {
    if (scope === "active" && c.__archived) return false;
    if (scope === "archived" && !c.__archived) return false;
    if (scope === "pinned" && !c.is_starred) return false;
    if (q && !(c.title || "").toLowerCase().includes(q)) return false;
    return true;
  });
}

function applyPreset(preset) {
  if (!preset) return;
  const visible = filtered();
  const visibleIds = new Set(visible.map((c) => c.id));

  const now = Date.now();
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = now - 7 * 86400000;

  const titleCounts = new Map();
  for (const c of allConvos) {
    const t = (c.title || "").trim().toLowerCase();
    if (!t) continue;
    titleCounts.set(t, (titleCounts.get(t) || 0) + 1);
  }

  const matchers = {
    visible: (c) => true,
    none: () => false,
    invert: null, // handled below
    today: (c) => new Date(c.update_time || c.create_time).getTime() >= startOfToday.getTime(),
    week: (c) => new Date(c.update_time || c.create_time).getTime() >= startOfWeek,
    30: (c) => now - new Date(c.update_time || c.create_time).getTime() > 30 * 86400000,
    90: (c) => now - new Date(c.update_time || c.create_time).getTime() > 90 * 86400000,
    180: (c) => now - new Date(c.update_time || c.create_time).getTime() > 180 * 86400000,
    365: (c) => now - new Date(c.update_time || c.create_time).getTime() > 365 * 86400000,
    untitled: (c) => !(c.title || "").trim(),
    short: (c) => (c.title || "").trim().length <= 10,
    duplicates: (c) => {
      const t = (c.title || "").trim().toLowerCase();
      return t && titleCounts.get(t) > 1;
    },
    "archived-only": (c) => c.__archived,
    unpinned: (c) => !c.is_starred,
    "unarchived-unpinned": (c) => !c.__archived && !c.is_starred,
  };

  const boxes = document.querySelectorAll("#delgpt-list input[type=checkbox]");
  if (preset === "invert") {
    boxes.forEach((cb) => (cb.checked = !cb.checked));
  } else {
    const match = matchers[preset];
    if (!match) return;
    boxes.forEach((cb) => {
      const id = cb.dataset.id;
      if (!visibleIds.has(id)) return;
      const c = allConvos.find((x) => x.id === id);
      cb.checked = !!(c && match(c));
    });
  }
  updateSelectionUi();
}

function updateSelectionUi() {
  const ids = selectedIds();
  const actions = document.getElementById("delgpt-actions");
  const count = document.getElementById("delgpt-sel-count");
  if (!actions || !count) return;
  if (ids.length === 0) {
    actions.hidden = true;
  } else {
    actions.hidden = false;
    count.textContent = `${ids.length} selected`;
  }
}

function renderList() {
  const list = document.getElementById("delgpt-list");
  if (!list) return;
  const items = filtered();
  list.innerHTML = "";
  if (items.length === 0) {
    list.innerHTML = `<div class="delgpt-empty">No matches.</div>`;
    setStatus(`0 / ${allConvos.length}`);
    updateSelectionUi();
    return;
  }
  const frag = document.createDocumentFragment();
  items.forEach((c) => {
    const row = document.createElement("label");
    row.className = "delgpt-item";
    if (c.__archived) row.classList.add("is-archived");
    if (c.is_starred) row.classList.add("is-pinned");
    const date = new Date(c.update_time || c.create_time);
    const dstr = isNaN(date) ? "" : date.toLocaleDateString();
    const icons = [];
    if (c.is_starred) icons.push(`<span class="delgpt-tag delgpt-t-pin" title="Pinned">★</span>`);
    if (c.__archived) icons.push(`<span class="delgpt-tag delgpt-t-arch" title="Archived">🗄</span>`);
    row.innerHTML = `
      <input type="checkbox" data-id="${c.id}" />
      <div class="delgpt-item-main">
        <div class="delgpt-item-title">${icons.join("")}${escapeHtml(c.title || "(untitled)")}</div>
        <div class="delgpt-item-meta">${dstr}</div>
      </div>
    `;
    frag.appendChild(row);
  });
  list.appendChild(frag);
  setStatus(`${items.length} / ${allConvos.length}`);
  updateSelectionUi();
}

function selectedIds() {
  return Array.from(document.querySelectorAll("#delgpt-list input[type=checkbox]:checked")).map(
    (cb) => cb.dataset.id
  );
}

function showProgress(label, total) {
  const overlay = document.getElementById("delgpt-progress");
  const lbl = document.getElementById("delgpt-progress-label");
  const cnt = document.getElementById("delgpt-progress-count");
  const fill = document.getElementById("delgpt-progress-fill");
  const fail = document.getElementById("delgpt-progress-fail");
  if (!overlay) return;
  overlay.hidden = false;
  overlay.classList.remove("done");
  lbl.textContent = label;
  cnt.textContent = `0 / ${total}`;
  fill.style.width = "0%";
  fail.textContent = "";
}

function updateProgress(done, total, failed) {
  const cnt = document.getElementById("delgpt-progress-count");
  const fill = document.getElementById("delgpt-progress-fill");
  const fail = document.getElementById("delgpt-progress-fail");
  if (!cnt) return;
  cnt.textContent = `${done} / ${total}`;
  fill.style.width = `${Math.round((done / total) * 100)}%`;
  fail.textContent = failed ? `${failed} failed` : "";
}

function finishProgress(label, autoHideMs = 1200) {
  const overlay = document.getElementById("delgpt-progress");
  const lbl = document.getElementById("delgpt-progress-label");
  if (!overlay) return;
  overlay.classList.add("done");
  lbl.textContent = label;
  setTimeout(() => {
    if (overlay) overlay.hidden = true;
  }, autoHideMs);
}

async function runBulk(action) {
  const ids = selectedIds();
  if (ids.length === 0) {
    setStatus("Nothing selected.");
    return;
  }
  const labels = {
    delete: { verb: "Deleting", past: "Deleted" },
    unarchive: { verb: "Unarchiving", past: "Unarchived" },
    unpin: { verb: "Unpinning", past: "Unpinned" },
  };
  const confirmLabel = { delete: "DELETE", unarchive: "UNARCHIVE", unpin: "UNPIN" }[action];
  if (!confirm(`${confirmLabel} ${ids.length} conversation(s)? This cannot be undone for deletes.`)) return;

  const methodMap = {
    delete: (id) => callApi("deleteConversation", [id]),
    unarchive: (id) => callApi("setArchived", [id, false]),
    unpin: (id) => callApi("setPinned", [id, false]),
  };
  const fn = methodMap[action];

  showProgress(`${labels[action].verb} chats…`, ids.length);
  let done = 0, failed = 0;
  for (const id of ids) {
    try {
      await fn(id);
      done++;
      if (action === "delete") allConvos = allConvos.filter((c) => c.id !== id);
      else {
        const c = allConvos.find((x) => x.id === id);
        if (c) {
          if (action === "unarchive") c.__archived = false;
          if (action === "unpin") c.is_starred = false;
        }
      }
    } catch (e) {
      failed++;
      console.error("Blanq", action, id, e);
    }
    updateProgress(done, ids.length, failed);
    await callApi("sleep", [200]);
  }
  renderList();
  updateSelectionUi();
  finishProgress(`${labels[action].past} ${done}${failed ? ` · ${failed} failed` : ""}`);
  const noun = done === 1 ? "chat" : "chats";
  const toastMsg = failed
    ? `${labels[action].past} ${done} ${noun} · ${failed} failed`
    : `${labels[action].past} ${done} ${noun}`;
  showToast(toastMsg, failed ? "warn" : "success");

  if (action === "delete" && done > 0 && !failed) {
    setTimeout(() => showThankYou(done), 900);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const PRESET_GROUPS = [
  {
    label: "Quick",
    items: [
      { value: "visible", label: "All visible", desc: "Tick every chat shown" },
      { value: "none", label: "Clear selection", desc: "Untick everything" },
      { value: "invert", label: "Invert", desc: "Flip what's ticked" },
    ],
  },
  {
    label: "By age",
    items: [
      { value: "today", label: "Today" },
      { value: "week", label: "This week" },
      { value: "30", label: "Older than 30 days" },
      { value: "90", label: "Older than 90 days" },
      { value: "180", label: "Older than 180 days" },
      { value: "365", label: "Older than 1 year" },
    ],
  },
  {
    label: "By content",
    items: [
      { value: "untitled", label: "Untitled only" },
      { value: "short", label: "Short titles (≤ 10 chars)" },
      { value: "duplicates", label: "Duplicate titles" },
    ],
  },
  {
    label: "By status",
    items: [
      { value: "archived-only", label: "All archived" },
      { value: "unpinned", label: "All unpinned" },
      { value: "unarchived-unpinned", label: "Unarchived & unpinned" },
    ],
  },
];

function openPresetMenu() {
  const existing = document.getElementById("delgpt-preset-menu");
  if (existing) { existing.remove(); return; }

  const trigger = document.getElementById("delgpt-preset-trigger");
  if (!trigger) return;

  const menu = document.createElement("div");
  menu.id = "delgpt-preset-menu";
  menu.className = "delgpt-menu";
  menu.innerHTML = PRESET_GROUPS
    .map(
      (g) => `
      <div class="delgpt-menu-group-label">${g.label}</div>
      ${g.items
        .map(
          (it) => `
        <button class="delgpt-menu-item" data-value="${it.value}">
          <span class="delgpt-menu-item-label">${escapeHtml(it.label)}</span>
          ${it.desc ? `<span class="delgpt-menu-item-desc">${escapeHtml(it.desc)}</span>` : ""}
        </button>`
        )
        .join("")}
    `
    )
    .join("");

  trigger.parentElement.appendChild(menu);
  trigger.classList.add("open");

  const close = () => {
    menu.remove();
    trigger.classList.remove("open");
    document.removeEventListener("mousedown", outside, true);
  };
  const outside = (e) => {
    if (menu.contains(e.target) || trigger.contains(e.target)) return;
    close();
  };
  setTimeout(() => document.addEventListener("mousedown", outside, true), 0);

  menu.addEventListener("click", (e) => {
    const item = e.target.closest(".delgpt-menu-item");
    if (!item) return;
    applyPreset(item.dataset.value);
    close();
  });
}

function showThankYou(deletedCount) {
  const panel = document.getElementById("delgpt-panel");
  if (!panel) return;
  const existing = panel.querySelector(".delgpt-thanks");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.className = "delgpt-thanks";
  overlay.innerHTML = `
    <div class="delgpt-thanks-card">
      <div class="delgpt-thanks-emoji">✨</div>
      <div class="delgpt-thanks-title">Thanks for using Blanq!</div>
      <div class="delgpt-thanks-sub">${deletedCount} ${deletedCount === 1 ? "chat" : "chats"} cleaned up.</div>
      <p class="delgpt-thanks-body">Chrome Web Store listing is coming soon. For now, a ⭐ on GitHub helps others find Blanq.</p>
      <div class="delgpt-thanks-actions">
        <button class="delgpt-btn-secondary" data-action="later">Maybe later</button>
        <a class="delgpt-btn-primary" href="https://github.com/llavkush/blanq" target="_blank" rel="noopener" data-action="review">Star on GitHub</a>
      </div>
    </div>
  `;
  panel.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target.closest("[data-action]")) overlay.remove();
    else if (e.target === overlay) overlay.remove();
  });
}

function showToast(message, kind = "success") {
  const panel = document.getElementById("delgpt-panel");
  if (!panel) return;
  const existing = panel.querySelector(".delgpt-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = `delgpt-toast delgpt-toast-${kind}`;
  const icon = kind === "warn" ? "!" : "✓";
  toast.innerHTML = `<span class="delgpt-toast-icon">${icon}</span><span>${escapeHtml(message)}</span>`;
  panel.appendChild(toast);
  // force reflow so the enter transition triggers
  // eslint-disable-next-line no-unused-expressions
  toast.offsetHeight;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---------- Boot ----------

function boot() {
  if (!/chatgpt\.com|chat\.openai\.com/.test(location.host)) return;
  createToggleButton();
  // Kick off preload after a delay so we don't fight ChatGPT's own initial requests.
  setTimeout(startPreload, 2500);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
