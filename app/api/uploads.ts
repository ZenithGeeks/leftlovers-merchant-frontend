const PATHS = {
  upload: "/api/minio/upload",
};

export type UploadResult = {
  id?: string;
  url: string;
  name?: string;
};

export default async function uploadFile(formData: FormData, opts?: { token?: string }) {
  const BASE =
    process.env.EXPO_PUBLIC_API_BASE ??
    (global as any).__API_BASE__ ??
    "https://backend-leftlovers-production.up.railway.app";
  const headers: Record<string, string> = {};
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(`${BASE}${PATHS.upload}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
  }
  if (!res.ok) {
    const msg = json?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json as UploadResult;
}
