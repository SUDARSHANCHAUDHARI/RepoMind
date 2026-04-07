// ─── Config ───────────────────────────────────────────────────────────────────
// Change this to your deployed URL in production
const APP_URL = "http://localhost:3000";

// ─── State ────────────────────────────────────────────────────────────────────
let currentUrl = "";
let lastResult = null;

const loadingMessages = [
  "Fetching repo structure...",
  "Running architect analysis...",
  "Extracting features...",
  "Reviewing code quality...",
  "Building rebuild plan...",
];

// ─── DOM helpers ──────────────────────────────────────────────────────────────
function show(id) {
  ["state-idle", "state-loading", "state-error", "state-result"].forEach((s) => {
    document.getElementById(s).style.display = s === id ? "block" : "none";
  });
}

function parseGitHubUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== "github.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1], display: `${parts[0]}/${parts[1]}` };
  } catch {
    return null;
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  currentUrl = tab?.url || "";
  const parsed = parseGitHubUrl(currentUrl);

  if (parsed) {
    document.getElementById("idle-github").style.display = "block";
    document.getElementById("idle-not-github").style.display = "none";
    document.getElementById("repo-name").textContent = parsed.display;
    document.getElementById("repo-url-display").textContent = currentUrl;
  } else {
    document.getElementById("idle-github").style.display = "none";
    document.getElementById("idle-not-github").style.display = "block";
  }
});

// ─── Analyze ──────────────────────────────────────────────────────────────────
document.getElementById("btn-analyze").addEventListener("click", () => analyze());
document.getElementById("btn-retry").addEventListener("click", () => {
  show("state-idle");
});
document.getElementById("btn-reset").addEventListener("click", () => {
  lastResult = null;
  show("state-idle");
});
document.getElementById("btn-open-full").addEventListener("click", () => {
  if (!lastResult) return;
  const encoded = encodeURIComponent(currentUrl);
  chrome.tabs.create({ url: `${APP_URL}?repo=${encoded}` });
});

async function analyze() {
  show("state-loading");

  let msgIndex = 0;
  const msgEl = document.getElementById("loading-msg");
  const interval = setInterval(() => {
    msgEl.textContent = loadingMessages[msgIndex % loadingMessages.length];
    msgIndex++;
  }, 2000);

  try {
    const res = await fetch(`${APP_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl: currentUrl }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Analysis failed");

    lastResult = data;
    renderResult(data);
    show("state-result");
  } catch (err) {
    document.getElementById("error-text").textContent = err.message;
    show("state-error");
  } finally {
    clearInterval(interval);
  }
}

function renderResult(data) {
  // Stack
  const stackEl = document.getElementById("res-stack");
  stackEl.innerHTML = "";
  (data.architect?.techStack || []).slice(0, 6).forEach((t) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = t;
    stackEl.appendChild(tag);
  });

  // Architecture
  document.getElementById("res-arch").textContent =
    data.architect?.architecture || "Not detected";

  // Features
  const featEl = document.getElementById("res-features");
  featEl.innerHTML = "";
  (data.features?.coreFeatures || []).slice(0, 5).forEach((f) => {
    const li = document.createElement("li");
    li.textContent = f;
    featEl.appendChild(li);
  });
}
