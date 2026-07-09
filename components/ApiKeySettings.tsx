"use client";

import { useEffect, useState } from "react";
import { getApiKey, setApiKey, clearApiKey } from "@/lib/apiKey";

// Self-contained "bring your own OpenAI key" control: a button + modal.
// The key is stored only in the browser (localStorage) and never saved on the server.
export default function ApiKeySettings() {
  const [open, setOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setHasKey(!!getApiKey());
    setDraft(getApiKey());
  }, []);

  function save() {
    const trimmed = draft.trim();
    setApiKey(trimmed);
    setHasKey(!!trimmed);
    setOpen(false);
  }

  function clear() {
    clearApiKey();
    setDraft("");
    setHasKey(false);
  }

  return (
    <>
      <button
        onClick={() => { setDraft(getApiKey()); setOpen(true); }}
        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
      >
        {hasKey ? "⚙ Key set" : "⚙ Add OpenAI key"}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setOpen(false)}>
          <div
            className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-semibold text-zinc-100 mb-1">OpenAI API key</div>
            <p className="text-sm text-zinc-500 mb-4">
              RepoMind uses your own OpenAI key. It is stored only in this browser and sent directly with your requests — never saved on the server.
            </p>

            <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-1">API key</label>
            <input
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={!draft.trim()}
                className="flex-1 py-2.5 bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition"
              >
                Save
              </button>
              {hasKey && (
                <button
                  onClick={clear}
                  className="px-4 py-2.5 border border-zinc-700 text-zinc-300 hover:border-red-700 hover:text-red-300 rounded-xl text-sm font-medium transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
