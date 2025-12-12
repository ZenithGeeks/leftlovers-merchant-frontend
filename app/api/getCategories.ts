// src/api/categories.ts
import { httpGet } from "@/lib/api";
export type Category = {
  id: number | string;
  name: string;
};


export async function getCategories(): Promise<Category[]> {
  return httpGet<Category[]>(`/api/merchant/categories`);
}
