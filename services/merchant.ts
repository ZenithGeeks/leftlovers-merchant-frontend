import { httpGet } from "@/lib/api";
import { MerchantAPI } from "@/types/types";
export async function fetchMerchant(merchantId:string): Promise<MerchantAPI> {
  return httpGet<MerchantAPI>(`/api/merchant/${merchantId}`)
}