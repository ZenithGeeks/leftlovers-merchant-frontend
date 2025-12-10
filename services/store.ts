// src/services/store.ts
import { httpGet, httpPut } from "@/lib/api";
import { Merchant, OpenStatus } from "@/types/types";
// Shape aligned with your /merchant/:merchantId/editstore response
export type StoreSettings = {
  id: string;
  name: string;
  storeImage: string | null;
  listImage: string | null;
  cuisine: {
    categoryId: string | null;
    type: string | null;
    certification: string | null;
  };
  businessHours: { day: string; hours: string }[];
  owner: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  contact: {
    storePhone: string | null;
  };
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
  };
  storeId: string;
};

// ✅ Same base style as services/employees.ts and services/finance.ts
const BASE =
  process.env.EXPO_PUBLIC_API_BASE ??
  "https://backend-leftlovers-production.up.railway.app/api";

/**
 * GET /merchant/:merchantId/editstore
 */
export async function fetchStoreSettings(
  merchantId: string
): Promise<StoreSettings> {
  const res = await fetch(`${BASE}/merchant/${merchantId}/editstore`);
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Fetch store settings failed (${res.status}): ${msg}`);
  }
  return res.json();
}
export type UpdateOpenStatusResponse = {
  openStatus: OpenStatus;
};
export async function updateOpenStatus(
  merchantId: string,
  status: OpenStatus
): Promise<UpdateOpenStatusResponse> {
  return httpPut<UpdateOpenStatusResponse>(
    `/api/merchant/${merchantId}/store-open-status`,
    { openStatus: status }
  );
}

/**
 * PUT /merchant/:merchantId/editstore
 */
export type UpdateStoreSettingsBody = {
  name?: string;
  storeImage?: string | null;
  listImage?: string | null;
  categoryId?: string;
  businessHours?: { day: string; hours: string }[];
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  contactStorePhone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
};

export async function fetchMerchant(merchantId:string): Promise<Merchant> {
  return httpGet<Merchant>(`/api/merchant/${merchantId}`)
}
export async function updateStoreSettings(
  merchantId: string,
  body: UpdateStoreSettingsBody
): Promise<StoreSettings> {
  const res = await fetch(`${BASE}/merchant/${merchantId}/editstore`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Update store settings failed (${res.status}): ${msg}`);
  }

  return res.json();
}

