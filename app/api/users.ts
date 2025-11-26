////////////JOY FIX ALL///////////////

// app/api/users.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type ApiErr = { message?: string; error?: string };

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { token?: string } = { token: "" as any }
): Promise<T> {
  const { token, ...init } = opts;
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };

  if (!(init.body instanceof FormData)) {
    // only set json header when not using FormData
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, { ...init, headers });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg =
      (json as ApiErr)?.message ??
      (json as ApiErr)?.error ??
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json as T;
}

// ---------- Merchant user creation ----------

export type CreateMerchantUserBody = {
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

const USER_PATHS = {
  createMerchantUser: "/api/merchant/user",
};

export async function createMerchant(
  body: CreateMerchantUserBody,
  opts?: { token?: string }
) {
  return apiFetch<{
    message: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
      avatarUrl: string | null;
      role: "MERCHANT";
      status: "ACTIVE" | "SUSPENDED" | "DELETED";
      createdAt: string;
      userId: string;
    };
    nextUrl: string;
  }>(USER_PATHS.createMerchantUser, {
    method: "POST",
    body: JSON.stringify(body),
    token: opts?.token ?? "",
  } as any);
}

////////////JOY FIX ALL//////////////