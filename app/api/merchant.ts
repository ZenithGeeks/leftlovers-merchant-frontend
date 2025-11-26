// app/api/merchant.ts
///////////JOY FIX ALL//////////////
import { apiFetch } from "./users";

export type MerchantSetupAddress = {
  label?: string | null;
  line1: string;
  line2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  lat?: number;
  lng?: number;
};

export type MerchantSetupFile = {
  kind: "COMMERCIAL_REG" | "OWNER_ID" | "STORE_IMAGE" | "OTHER";
  url: string;
  label?: string | null;
};

export type MerchantSetupBody = {
  userId: string;
  displayName: string;
  branchName?: string | null;
  description?: string | null;
  categoryId: string;
  openHours?: any;
  listImageUrl?: string | null;
  storeImageUrl?: string | null; // maps to StoreImageUrl in DB
  address: MerchantSetupAddress;
  files?: MerchantSetupFile[];
};

const PATHS = {
  createMerchantInfo: "/api/merchant/setup",
  getMerchantByUser: (userId: string) => `/api/merchant/user/${userId}`,
  updateMerchantByUser: (userId: string) => `/api/merchant/user/${userId}`,
};

export async function createMerchantInfo(body: MerchantSetupBody, opts?: { token?: string }) {
  return apiFetch<{ message?: string; merchant?: any }>(PATHS.createMerchantInfo, {
    method: "POST",
    body: JSON.stringify(body),
    token: opts?.token ?? "",
  } as any);
}

export async function getMerchant(userId: string, opts?: { token?: string }) {
  return apiFetch<{ merchant?: any }>(PATHS.getMerchantByUser(userId), {
    method: "GET",
    token: opts?.token ?? "",
  } as any);
}

export async function updateMerchant(
  userId: string,
  body: Partial<MerchantSetupBody>,
  opts?: { token?: string }
) {
  return apiFetch<{ message?: string; merchant?: any }>(PATHS.updateMerchantByUser(userId), {
    method: "PATCH",
    body: JSON.stringify(body),
    token: opts?.token ?? "",
  } as any);
}
////////////JOY FIX ALL//////////////