// Runs in the page context. Listens for API requests from the content script and invokes
// DelGPT_API methods, posting results back. Loaded as an external file to satisfy CSP.

window.addEventListener("message", async (ev) => {
  if (ev.source !== window || !ev.data || ev.data.__delgpt !== "request") return;
  const { reqId, method, args } = ev.data;
  try {
    const fn = window.DelGPT_API && window.DelGPT_API[method];
    if (!fn) throw new Error("Unknown method: " + method);
    const result = await fn(...args);
    window.postMessage({ __delgpt: "response", reqId, ok: true, result }, "*");
  } catch (e) {
    window.postMessage({ __delgpt: "response", reqId, ok: false, error: e.message }, "*");
  }
});
