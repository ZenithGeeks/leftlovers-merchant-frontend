import { postJSON } from "@/lib/api";
import { CreateMerchantBody } from "@/types/types";
import { apiFetch } from "./users"; // re-use the exported apiFetch 



const PATHS = {
  createMerchantInfo: "/api/merchant/setup",
  getMerchant: (id: string) => `/api/merchant/user/${id}`,
  updateMerchant: (id: string) => `/api/merchant/user/${id}`,
};

export default async function createMerchantInfo(
  payload: CreateMerchantBody
) {
  return postJSON<{ message?: string; merchant?: any }>(
    "/api/merchant/setup",
    payload
  );
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