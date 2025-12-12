// src/services/store.ts
import { httpGet, httpPut } from "@/lib/api";
import { Merchant, OpenStatus } from "@/types/types";

export type DailySlot = { open: string; close: string };

export type WeeklySchedule = {
  mon?: DailySlot[];
  tue?: DailySlot[];
  wed?: DailySlot[];
  thu?: DailySlot[];
  fri?: DailySlot[];
  sat?: DailySlot[];
  sun?: DailySlot[];
};

export type BusinessHours = {
  weekly?: WeeklySchedule;
  timezone?: string | null;
  exceptions?: any[] | null;
};

/** Existing type – only touched the `businessHours` line */
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
  
  businessHours: BusinessHours | { day: string; hours: string }[] | any;
  owner: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
    lat?: number | null; // number from backend
    lng?: number | null;
  };
  storeId: string;
};

const BASE =
  process.env.EXPO_PUBLIC_API_BASE ??
  "https://backend-leftlovers-production.up.railway.app/api";

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

export type UpdateStoreSettingsBody = {
  name?: string;
  storeImage?: string | null;
  listImage?: string | null;
  categoryId?: string;
  businessHours?: { day: string; hours: string }[] | any;
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
    lat?: number; // Decimal backend
    lng?: number;
  };
};

export async function fetchMerchant(ownerUserId: string): Promise<Merchant> {
  return httpGet<Merchant>(`/api/merchant/merchant/${ownerUserId}/LandingDashboard`);
}

export async function fetchMerchantById(
  merchantId: string
): Promise<Merchant | null> {
  try {
    return await httpGet<Merchant>(`/api/merchant/${encodeURIComponent(merchantId)}`);
  } catch {
    return null;
  }
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
