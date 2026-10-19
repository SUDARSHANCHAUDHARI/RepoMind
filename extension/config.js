// ─── Config ───────────────────────────────────────────────────────────────────
// Deployed web app. Override it (e.g. http://localhost:3000 for local dev) on the
// extension's Options page; the override is kept in chrome.storage.sync.
const DEFAULT_APP_URL = "https://repomind.sudarshantechlabs.com";

async function getAppUrl() {
  const { appUrl } = await chrome.storage.sync.get({ appUrl: DEFAULT_APP_URL });
  return (appUrl || DEFAULT_APP_URL).replace(/\/+$/, "");
}

// The user's own OpenAI key (bring-your-own-key, sent as x-api-key). Kept in
// chrome.storage.local so it never syncs to other devices.
async function getApiKey() {
  const { apiKey } = await chrome.storage.local.get({ apiKey: "" });
  return apiKey;
}
