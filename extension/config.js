// ─── Config ───────────────────────────────────────────────────────────────────
// Deployed web app. Override it (e.g. http://localhost:3000 for local dev) on the
// extension's Options page; the override is kept in chrome.storage.sync.
const DEFAULT_APP_URL = "https://repomind.sudarshantechlabs.com";

async function getAppUrl() {
  const { appUrl } = await chrome.storage.sync.get({ appUrl: DEFAULT_APP_URL });
  return (appUrl || DEFAULT_APP_URL).replace(/\/+$/, "");
}
