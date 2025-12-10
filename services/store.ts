// src/services/store.ts

export type WeeklySlot = {
  open: string;   // "08:00"
  close: string;  // "18:00"
};

export type WeeklySchedule = {
  mon?: WeeklySlot[];
  tue?: WeeklySlot[];
  wed?: WeeklySlot[];
  thu?: WeeklySlot[];
  fri?: WeeklySlot[];
  sat?: WeeklySlot[];
  sun?: WeeklySlot[];
};

export type BusinessHours = {
  weekly: WeeklySchedule;
  timezone: string;    // e.g. "Asia/Bangkok"
  exceptions: any[];   // keep as any[] for now
};

export type StoreSettings = {
  id: string;
  name: string | null;
  storeImage: string | null;
  listImage: string | null;

  cuisine?: {
    categoryId: string | null;
    type: string | null;
    certification: string | null;
  } | null;

  businessHours?: BusinessHours | null;

  owner?: {
    name: string | null;
    phone: string | null;
    email: string | null;
  } | null;

  contact?: {
    storePhone?: string | null;
  } | null;

  address?: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
  } | null;

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

export type UpdateStoreSettingsBody = {
  name?: string;
  storeImage?: string | null;
  listImage?: string | null;

  categoryId?: string;

  businessHours?: BusinessHours;

  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;

  storeContactPhone?: string | null;

  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
};

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
