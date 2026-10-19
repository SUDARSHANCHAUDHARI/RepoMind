const input = document.getElementById("app-url");
const keyInput = document.getElementById("api-key");
const status = document.getElementById("status");

getAppUrl().then((url) => {
  input.value = url;
});
getApiKey().then((key) => {
  keyInput.value = key;
});

async function saveSettings(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Use an http(s) URL");
    const appUrl = url.origin + url.pathname.replace(/\/+$/, "");
    // The default origin is in host_permissions; any other origin needs an optional
    // host permission so the popup's fetch is not blocked by CORS. Request it first,
    // while the click still counts as a user gesture.
    if (url.origin !== new URL(DEFAULT_APP_URL).origin) {
      const granted = await chrome.permissions.request({ origins: [`${url.protocol}//${url.hostname}/*`] });
      if (!granted) throw new Error(`access to ${url.origin} was not granted`);
    }
    await chrome.storage.sync.set({ appUrl });
    const apiKey = keyInput.value.trim();
    if (apiKey) await chrome.storage.local.set({ apiKey });
    else await chrome.storage.local.remove("apiKey");
    input.value = appUrl;
    status.textContent = "Saved.";
  } catch (err) {
    status.textContent = `Not saved: ${err.message}`;
  }
}

document.getElementById("options-form").addEventListener("submit", (event) => {
  event.preventDefault();
  saveSettings(input.value.trim());
});

document.getElementById("btn-default").addEventListener("click", () => {
  saveSettings(DEFAULT_APP_URL);
});
