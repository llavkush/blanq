// ChatGPT internal API client. Uses the session bearer token fetched from /api/auth/session.

const API_BASE = `${location.origin}/backend-api`;

let cachedToken = null;
let cachedTokenExpiry = 0;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiry) return cachedToken;

  const res = await fetch("/api/auth/session", { credentials: "include" });
  if (!res.ok) throw new Error(`Session fetch failed: ${res.status}`);
  const data = await res.json();
  if (!data.accessToken) throw new Error("No access token in session (are you logged in?)");

  cachedToken = data.accessToken;
  cachedTokenExpiry = now + 5 * 60 * 1000;
  return cachedToken;
}

async function apiFetch(path, options = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    credentials: "include",
  });
  if (res.status === 401) {
    cachedToken = null;
    throw new Error("Unauthorized — session expired, please refresh the page");
  }
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function listConversations({ offset = 0, limit = 100, isArchived = false } = {}) {
  const q = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
    order: "updated",
    is_archived: String(isArchived),
  });
  return apiFetch(`/conversations?${q}`);
}

async function listAllConversations({ isArchived = false, onProgress } = {}) {
  const limit = 100;
  const first = await listConversations({ offset: 0, limit, isArchived });
  const items = first.items || [];
  const total = first.total ?? items.length;
  if (onProgress) onProgress(items.length, total);
  if (items.length >= total || items.length < limit) return items;

  const offsets = [];
  for (let o = limit; o < total; o += limit) offsets.push(o);

  const all = [...items];
  const concurrency = 5;
  let cursor = 0;
  async function worker() {
    while (cursor < offsets.length) {
      const offset = offsets[cursor++];
      const page = await listConversations({ offset, limit, isArchived });
      all.push(...(page.items || []));
      if (onProgress) onProgress(all.length, total);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return all;
}

async function deleteConversation(id) {
  return apiFetch(`/conversation/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ is_visible: false }),
  });
}

async function setArchived(id, isArchived) {
  return apiFetch(`/conversation/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ is_archived: isArchived }),
  });
}

async function setPinned(id, isStarred) {
  return apiFetch(`/conversation/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ is_starred: isStarred }),
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

window.DelGPT_API = {
  getAccessToken,
  listConversations,
  listAllConversations,
  deleteConversation,
  setArchived,
  setPinned,
  sleep,
};
