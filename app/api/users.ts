const BASE =
  process.env.EXPO_PUBLIC_API_BASE ??
  (global as any).__API_BASE__ ??
  "https://backend-leftlovers-production.up.railway.app"; 

export type Role = "CUSTOMER" | "MERCHANT" | "ADMIN" | "STAFF";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export type CreateUserBody = {
  id: string;
  email: string;
  role: Role;
  name?: string;
  phone?: string | null;
  dob?: string | null;
  avatarUrl?: string | null;
  status?: UserStatus;
};

type ApiOk<T> = { ok?: boolean; message?: string; user?: T; data?: T } & Record<string, any>;
type ApiErr = { message?: string; error?: string } & Record<string, any>;

type FetchOpts = RequestInit & { token?: string };

async function apiFetch<T>(path: string, init: FetchOpts = {}): Promise<T> {
  // Merge headers but be careful about FormData
  const providedHeaders = (init.headers as Record<string,string> | undefined) ?? {};
  const isFormData = init.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...providedHeaders,
  };

  if (init.token) headers.Authorization = `Bearer ${init.token}`;

  const method = (init.method ?? "GET").toUpperCase();

  // Only attach body for non-GET/HEAD
  const fetchInit: RequestInit = {
    method,
    headers,
  };
  if (init.body !== undefined && method !== "GET" && method !== "HEAD") {
    fetchInit.body = init.body;
  }

  const res = await fetch(`${BASE}${path}`, fetchInit);

  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // non-JSON body, keep json as empty object
  }

  if (!res.ok) {
    const msg = (json as ApiErr)?.message || (json as ApiErr)?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}


const PATHS = {
  user: "/api/customer",
};

export default async function createMerchant(
  body: CreateUserBody,
  opts?: { token?: string }
) {
  return apiFetch<ApiOk<any>>(PATHS.user, {
    method: "POST",
    body: JSON.stringify(body),
    token: opts?.token,
  });
}

export { apiFetch };
