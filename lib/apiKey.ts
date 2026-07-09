const KEY_STORAGE = "repomind_openai_key";

export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY_STORAGE) ?? "";
}

export function setApiKey(key: string): void {
  localStorage.setItem(KEY_STORAGE, key);
}

export function clearApiKey(): void {
  localStorage.removeItem(KEY_STORAGE);
}

// Headers to attach to any request that triggers an OpenAI call.
export function getAiHeaders(): Record<string, string> {
  const key = getApiKey();
  return key ? { "x-api-key": key } : {};
}
