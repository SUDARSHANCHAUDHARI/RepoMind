const input = document.getElementById("app-url");
const status = document.getElementById("status");

getAppUrl().then((url) => {
  input.value = url;
});

async function saveAppUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Use an http(s) URL");
    const appUrl = url.origin + url.pathname.replace(/\/+$/, "");
    await chrome.storage.sync.set({ appUrl });
    input.value = appUrl;
    status.textContent = "Saved.";
  } catch (err) {
    status.textContent = `Not saved: ${err.message}`;
  }
}

document.getElementById("options-form").addEventListener("submit", (event) => {
  event.preventDefault();
  saveAppUrl(input.value.trim());
});

document.getElementById("btn-default").addEventListener("click", () => {
  saveAppUrl(DEFAULT_APP_URL);
});
