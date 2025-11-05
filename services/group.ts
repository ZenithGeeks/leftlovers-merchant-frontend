import { httpDelete, httpGet, postJSON } from "@/lib/api";

export interface OptionAPI {
  id: string;
  optionGroupId: string;
  name: string;
  priceDelta: number;
  active: boolean;
  sortOrder: number;
}

export interface OptionGroupAPI {
  id: string;
  merchantId: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  options: OptionAPI[];
}

export type OptionCreateInput = {
  name: string;
  priceDelta: number;
  active: boolean;
  sortOrder?: number;
};
export type OptionGroupCreateInput = {
  name: string;
  merchantId: string;
  minSelect: number;
  maxSelect: number;
  options: OptionCreateInput[];
};

export async function fetchMerchantOptionGroups(merchantId: string): Promise<OptionGroupAPI[]> {
  return httpGet<OptionGroupAPI[]>(`/api/merchant/${merchantId}/group`);
}
export async function createMerchantOptionGroup(
  merchantId: string,
  payload: OptionGroupCreateInput,
): Promise<OptionGroupAPI> {
  return postJSON<OptionGroupAPI>(`/api/merchant/${merchantId}/group`, payload);
}

export async function deleteOptionGroup(merchantId: string, groupId: string) {
  return httpDelete<{ message?: string }>(`/api/merchant/${merchantId}/group/${groupId}`);
}

export async function deleteGroupOption(
  merchantId: string,
  groupId: string,
  optionId: string
) {
  return httpDelete<{ message?: string }>(
    `/api/merchant/${merchantId}/group/${groupId}/options/${optionId}`
  );
}
