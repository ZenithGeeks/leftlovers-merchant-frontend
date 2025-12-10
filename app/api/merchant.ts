import { apiFetch } from "./users"; // re-use the exported apiFetch

// types
export type CreateMerchantBody = {
  id: string;
  ownerUserId: string;
  displayName: string;
  branchName?: string | null;
  description?: string | null;
  categoryId: string;

  // user sends full address object
  address: {
    label: string | null;
    line1: string;
    line2: string;
    city: string;
    province: string;
    postalCode: string;
    lat: number;
    lng: number;
  };

  openHours?: any;
  listImageUrl?: string | null;
  StoreImageUrl?: string | null;

  files: {
    kind: string;
    url: string;
    label: string;
  }[];
};

const PATHS = {
  createMerchantInfo: "/api/merchant/setup",
  getMerchant: (id: string) => `/api/merchant/user/${id}`,
  updateMerchant: (id: string) => `/api/merchant/user/${id}`,
};

export default async function createMerchantInfo(body: CreateMerchantBody, opts?: { token?: string }) {
  return apiFetch<{ message?: string; merchant?: any }>(PATHS.createMerchantInfo, {
    method: "POST",
    body: JSON.stringify(body),
    token: opts?.token,
  });
}

export async function getMerchant(merchantId: string, opts?: { token?: string }) {
  return apiFetch<{ merchant?: any }>(PATHS.getMerchant(merchantId), {
    method: "GET",
    token: opts?.token,
  });
}

export async function updateMerchant(merchantId: string, body: Partial<CreateMerchantBody>, opts?: { token?: string }) {
  return apiFetch<{ message?: string; merchant?: any }>(PATHS.updateMerchant(merchantId), {
    method: "PATCH",
    body: JSON.stringify(body),
    token: opts?.token,
  });
}