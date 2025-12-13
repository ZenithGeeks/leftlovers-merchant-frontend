// src/api/categories.ts
import { httpGet } from "@/lib/api";
export type Category = {
  id: number | string;
  name: string;
};

export default async function getCategories(): Promise<Category[]> {
  return httpGet<Category[]>(`/api/merchant/categories`);
}
