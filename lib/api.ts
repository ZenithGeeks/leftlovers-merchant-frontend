// lib/api.ts
export const API_HOST = process.env.EXPO_PUBLIC_API_HOST ?? "http://localhost:3000";
const DEFAULT_TIMEOUT_MS = 12000;
type Json = Record<string, any>;

export async function postJSON<T = unknown>(
  path: string,
  body: Json,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_HOST}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    body: JSON.stringify(body),
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${path} failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export async function httpGet<T>(path: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  const res = await fetch(`${API_HOST}${path}`, { signal: ctrl.signal });
  clearTimeout(t);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function httpDelete<T = unknown>(
  path: string,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  const res = await fetch(`${API_HOST}${path}`, {
    method: "DELETE",
    ...(init ?? {}),
    signal: ctrl.signal,
  });

  clearTimeout(t);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DELETE ${path} failed: ${res.status} ${text}`);
  }
  // Some DELETE endpoints return empty body — guard for that:
  const text = await res.text();
  return (text ? JSON.parse(text) : ({} as T)) as T;
}


