// In dev, Vite proxies /api to the backend (see vite.config.js). In
// production, point VITE_API_BASE at your deployed backend's origin.
const BASE = `${import.meta.env.VITE_API_BASE || ""}/api`;

async function handle(res) {
  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore — keep default message, never leak raw text/stack traces
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export function getClientId() {
  let id = localStorage.getItem("aijukebox:clientId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("aijukebox:clientId", id);
  }
  return id;
}

export async function analyzeTask(query) {
  const res = await fetch(`${BASE}/analyze-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, clientId: getClientId() }),
  });
  return handle(res);
}

export async function fetchWorkflow(id) {
  const res = await fetch(`${BASE}/workflows/${id}`);
  return handle(res);
}

export async function fetchTools(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/tools${qs ? `?${qs}` : ""}`);
  return handle(res);
}
