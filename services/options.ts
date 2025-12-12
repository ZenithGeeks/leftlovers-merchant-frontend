import { putJSON } from "@/lib/api";

export type UpdateOptionStatusInput = {
  active: boolean;
};

export type OptionAPI = {
  id: string;
  name: string;
  priceDelta: number;
  active: boolean;
  sortOrder?: number;
  optionGroupId?: string;
};

export async function updateOptionStatus(
  optionId: string,
  active: boolean
): Promise<OptionAPI> {
  return putJSON<OptionAPI>(
    `/api/merchant/option/${encodeURIComponent(optionId)}`,
    { active } satisfies UpdateOptionStatusInput
  );
}
